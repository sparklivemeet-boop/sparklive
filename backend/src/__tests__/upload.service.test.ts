import { UploadService, getFileType, buildUploadUrl } from '../services/upload.service';
import fs from 'fs';
import path from 'path';

jest.mock('fs');
jest.mock('path');

const uploadService = new UploadService();

describe('UploadService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getFileType', () => {
    test('should return IMAGE for image mime types', () => {
      expect(getFileType('image/jpeg')).toBe('IMAGE');
      expect(getFileType('image/png')).toBe('IMAGE');
      expect(getFileType('image/webp')).toBe('IMAGE');
    });

    test('should return VIDEO for video mime types', () => {
      expect(getFileType('video/mp4')).toBe('VIDEO');
      expect(getFileType('video/webm')).toBe('VIDEO');
    });

    test('should return AUDIO for audio mime types', () => {
      expect(getFileType('audio/mpeg')).toBe('AUDIO');
      expect(getFileType('audio/wav')).toBe('AUDIO');
    });

    test('should return DOCUMENT for other types', () => {
      expect(getFileType('application/pdf')).toBe('DOCUMENT');
      expect(getFileType('text/plain')).toBe('DOCUMENT');
    });
  });

  describe('uploadFile', () => {
    test('should generate upload URL', async () => {
      const mockReq = { protocol: 'http', get: jest.fn().mockReturnValue('localhost:5000') };
      const mockFile = { filename: 'test.jpg', mimetype: 'image/jpeg' } as Express.Multer.File;

      const result = await uploadService.uploadFile(mockReq, mockFile);
      expect(result.url).toBe('http://localhost:5000/uploads/test.jpg');
      expect(result.type).toBe('IMAGE');
      expect(result.filename).toBe('test.jpg');
    });
  });

  describe('deleteFile', () => {
    test('should delete file if exists', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});
      (path.join as jest.Mock).mockReturnValue('/uploads/test.jpg');

      await uploadService.deleteFile('test.jpg');
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    test('should not throw if file does not exist', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(uploadService.deleteFile('nonexistent.jpg')).resolves.not.toThrow();
    });
  });
});