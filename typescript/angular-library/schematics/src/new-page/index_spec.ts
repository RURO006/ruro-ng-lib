import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { strings } from '@angular-devkit/core';
import { parseName } from '@schematics/angular/utility/parse-name';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import { NewPageSchema } from './schema';

const collectionPath = path.join(__dirname, '../collection.json');

describe('new-page', () => {
  const runner = new SchematicTestRunner('schematics', collectionPath);

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace', // 不重要的名字，隨便取，不影響測試結果
    newProjectRoot: 'projects', // 專案裡，所有 App 的根目錄，可以隨便取，驗證時會用到
    version: '0.1.0', // 不重要的版號，隨便取，不影響測試結果
  };
  let appOptions: ApplicationOptions = {
    name: 'TestProject', // 專案名稱
    inlineStyle: false, // true or false 都可以，不影響測試結果
    inlineTemplate: false, // true or false 都可以，不影響測試結果
    routing: true, // true or false 都可以，不影響測試結果
    style: Style.Scss, // Css / Less / Sass / scss / styl 都可以，不影響測試結果
    skipTests: false, // true or false 都可以，不影響測試結果
    skipPackageJson: false, // true or false 都可以，不影響測試結果
  };

  let workspaceTree;
  let appTree: any;
  beforeEach(async () => {
    workspaceTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions)
      .toPromise();
    appTree = await runner
      .runExternalSchematicAsync('@schematics/angular', 'application', appOptions, workspaceTree)
      .toPromise();
  });

  const expectResult = async (fileName: string = 'page/HelloWorld') => {
    const options: NewPageSchema = { name: fileName };

    const tree = await runner.runSchematicAsync('new-page', options, appTree).toPromise();

    // const params = fileName ? { name: fileName } : {};
    // const runner = new SchematicTestRunner('schematics', collectionPath);
    // const tree = runner.runSchematic('new-page', { ...params, test: true }, Tree.empty());
    fileName = strings.dasherize(`${fileName}`);
    // console.log('-------------', tree.files);
    // console.log('fileName', fileName);
    const { name, path: path2 } = parseName('/src/app', fileName);
    // console.log('name', name);
    // console.log('path', path);
    [
      `${path2}/${name}/${name}-routing.module.ts`,
      `${path2}/${name}/${name}.component.html`,
      `${path2}/${name}/${name}.component.scss`,
      `${path2}/${name}/${name}.component.ts`,
      `${path2}/${name}/${name}.module.ts`,
    ].forEach((filePath) => {
      expect(tree.files).toMatch(filePath);
    });
  };

  it('使用者沒給檔名，則檔名為 "/HelloWorld"', async () => {
    await expectResult();
  });
  it('使用者有給檔名，則檔名為使用者給的檔名', async () => {
    await expectResult('MyTestPage');
  });
  it('改變專案名稱，使用者有給檔名，則檔名為使用者給的檔名', async () => {
    appOptions = { ...appOptions, name: 'NewTestProj' };
    await expectResult('page/MyTest');
  });
});
