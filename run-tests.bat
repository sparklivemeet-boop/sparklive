@echo off  
set NODE_PATH=e:\SparkLive\backend\node_modules;e:\SparkLive\node_modules  
npx --prefix e:\SparkLive\backend jest --config jest.config.js --no-coverage  
