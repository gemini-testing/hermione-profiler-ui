import path from 'path';

import fs from 'fs-extra';

import { generateReporter } from './api';

jest.mock('fs-extra');

describe('tools/api', () => {
  describe('generateReport', () => {
    test('should create dir with dest if it does not exist', async () => {
      const targetDir = 'target';

      await generateReporter([], targetDir);

      expect(fs.ensureDir).toHaveBeenCalledWith(
        path.resolve(targetDir)
      );
    });

    test('should copy static files to the target', async () => {
      await generateReporter([], 'target');

      expect(fs.copy).toBeCalledTimes(2);
      expect(fs.copy).toHaveBeenCalledWith(
        path.resolve(__dirname, '..', 'build/static'),
        path.join(process.cwd(), 'target/static')
      );
      expect(fs.copy).toHaveBeenCalledWith(
        path.resolve(__dirname, '..', 'build/index.html'),
        path.join(process.cwd(), 'target/index.html')
      );
    });

    test('should generate file-declaration', async () => {
      const files = [
        'http://site.com/file1.json',
        'http://site.com/file2.json',
      ];

      await generateReporter(files, 'target');

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), 'target/files.js'),
        'window.HERMIONE_PROFILER_FILES_DECLARATION = {plugins: ["http://site.com/file1.json","http://site.com/file2.json"]};'
      );
    });
  });
});
