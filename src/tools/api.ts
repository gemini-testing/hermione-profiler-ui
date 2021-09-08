import path from 'path';

import fs from 'fs-extra';

export async function generateReporter(
  filePaths: string[],
  targetPath: string
) {
  const whitelist = ['static', 'index.html'];
  const dist = path.resolve(path.dirname(__filename), '../', 'build');
  const target = path.resolve(process.cwd(), targetPath);
  const fileDeclarations = path.join(target, 'files.js');

  await fs.ensureDir(target);
  await Promise.all(
    whitelist.map((allowedPath) =>
      fs.copy(
        path.join(dist, allowedPath),
        path.join(target, allowedPath)
      )
    )
  );

  const files = filePaths.map((fileName) => JSON.stringify(fileName));

  await fs.writeFile(
    fileDeclarations,
    `
    window.HERMIONE_PROFILER_FILES_DECLARATION = {
      plugins: [${files}]
    };
  `.replace(/\s{2,}/g, '')
  );
}

exports.generateReporter = generateReporter;
