#!/bin/bash
# =============================================================================
# SparkLive - Production Deployment Script
# Supports: Blue-Green, Rolling, Canary deployments
# =============================================================================

set -euo pipefail

# Configuration
NAMESPACE="${NAMESPACE:-sparklive}"
REGISTRY="${REGISTRY:-docker.io/sparklive}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
DEPLOY_STRATEGY="${DEPLOY_STRATEGY:-rolling}"
DEPLOY_TIMEOUT="${DEPLOY_TIMEOUT:-300}"
HEALTH_CHECK_RETRIES="${HEALTH_CHECK_RETRIES:-30}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-10}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Validate prerequisites
validate_prereqs() {
    log_info "Validating prerequisites..."
    
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required"; exit 1; }
    command -v kustomize >/dev/null 2>&1 || { log_warn "kustomize not found, using kubectl directly"; }
    
    kubectl cluster-info >/dev/null 2>&1 || { log_error "Cannot connect to Kubernetes cluster"; exit 1; }
    kubectl get namespace "${NAMESPACE}" >/dev/null 2>&1 || { log_error "Namespace ${NAMESPACE} not found"; exit 1; }
    
    log_info "Prerequisites validated"
}

# Build and push images
build_and_push() {
    local services=("frontend" "backend" "websocket" "worker" "media" "admin")
    
    for service in "${services[@]}"; do
        log_info "Building ${service} image..."
        docker build \
            -f "infrastructure/Dockerfile.${service}" \
            -t "${REGISTRY}/sparklive-${service}:${IMAGE_TAG}" \
            -t "${REGISTRY}/sparklive-${service}:latest" \
            .
        
        log_info "Pushing ${service} image..."
        docker push "${REGISTRY}/sparklive-${service}:${IMAGE_TAG}"
        docker push "${REGISTRY}/sparklive-${service}:latest"
    done
    
    log_info "All images built and pushed"
}

# Rolling deployment
deploy_rolling() {
    log_info "Starting rolling deployment..."
    
    cd infrastructure/k8s
    
    # Update images
    kustomize edit set image \
        "${REGISTRY}/sparklive-frontend:${IMAGE_TAG}" \
        "${REGISTRY}/sparklive-backend:${IMAGE_TAG}" \
        "${REGISTRY}/sparklive-websocket:${IMAGE_TAG}" \
        "${REGISTRY}/sparklive-worker:${IMAGE_TAG}" \
        "${REGISTRY}/sparklive-media:${IMAGE_TAG}" \
        "${REGISTRY}/sparklive-admin:${IMAGE_TAG}"
    
    # Apply
    kustomize build . | kubectl apply -f - -n "${NAMESPACE}" --validate=true
    
    # Wait for rollouts
    local deployments=("frontend" "backend-api" "websocket" "worker")
    for deploy in "${deployments[@]}"; do
        log_info "Waiting for ${deploy} rollout..."
        kubectl rollout status "deployment/${deploy}" -n "${NAMESPACE}" --timeout="${DEPLOY_TIMEOUT}s"
    done
}

# Blue-Green deployment
deploy_blue_green() {
    log_info "Starting blue-green deployment..."
    
    # Determine colors
    local current_color
    current_color=$(kubectl get service frontend -n "${NAMESPACE}" \
        -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")
    local new_color
    [ "$current_color" = "blue" ] && new_color="green" || new_color="blue"
    
    log_info "Current: ${current_color}, Deploying: ${new_color}"
    
    # Deploy with new color label
    kubectl set image "deployment/frontend" \
        "frontend=${REGISTRY}/sparklive-frontend:${IMAGE_TAG}" \
        -n "${NAMESPACE}"
    kubectl patch deployment frontend -n "${NAMESPACE}" \
        -p "{\"spec\":{\"template\":{\"metadata\":{\"labels\":{\"color\":\"${new_color}\"}}}}}"
    
    # Wait for readiness
    kubectl rollout status "deployment/frontend" -n "${NAMESPACE}" --timeout="${DEPLOY_TIMEOUT}s"
    
    # Switch traffic
    kubectl patch service frontend -n "${NAMESPACE}" \
        -p "{\"spec\":{\"selector\":{\"color\":\"${new_color}\"}}}"
    
    log_info "Traffic switched to ${new_color}"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    local endpoints=(
        "https://sparklive.com/health"
        "https://api.sparklive.com/health"
        "https://ws.sparklive.com/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local retries=0
        while [ $retries -lt "${HEALTH_CHECK_RETRIES}" ]; do
            if curl -sf "$endpoint" >/dev/null 2>&1; then
                log_info "✓ ${endpoint} is healthy"
                break
            fi
            retries=$((retries + 1))
            sleep "${HEALTH_CHECK_INTERVAL}"
        done
        
        if [ $retries -eq "${HEALTH_CHECK_RETRIES}" ]; then
            log_error "✗ ${endpoint} failed health check"
            return 1
        fi
    done
}

# Rollback
rollback() {
    log_info "Rolling back deployment..."
    
    kubectl rollout undo "deployment/frontend" -n "${NAMESPACE}"
    kubectl rollout undo "deployment/backend-api" -n "${NAMESPACE}"
    kubectl rollout undo "deployment/websocket" -n "${NAMESPACE}"
    
    health_check
    log_info "Rollback completed"
}

# Main
main() {
    log_info "=== SparkLive Deployment ==="
    log_info "Strategy: ${DEPLOY_STRATEGY}"
    log_info "Tag: ${IMAGE_TAG}"
    
    validate_prereqs
    build_and_push
    
    case "${DEPLOY_STRATEGY}" in
        rolling)
            deploy_rolling
            ;;
        blue-green)
            deploy_blue_green
            ;;
        canary)
            deploy_rolling  # Simplified; canary uses Istio traffic splitting
            ;;
        *)
            log_error "Unknown strategy: ${DEPLOY_STRATEGY}"
            exit 1
            ;;
    esac
    
    if health_check; then
        log_info "=== Deployment Successful ==="
    else
        log_error "=== Deployment Failed, Rolling Back ==="
        rollback
        exit 1
    fi
}

main "$@"