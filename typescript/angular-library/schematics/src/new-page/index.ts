import {
  Rule,
  Tree,
  url,
  apply,
  mergeWith,
  chain,
  SchematicsException,
  applyTemplates,
  move,
} from '@angular-devkit/schematics';
import { strings, normalize } from '@angular-devkit/core'; // 引入 strings ，所有的字串處理函式都在裡面

import { parseName } from '@schematics/angular/utility/parse-name';
import { buildDefaultPath } from '@schematics/angular/utility/project';

import { buildRelativePath } from '@schematics/angular/utility/find-module';

import * as ts from 'typescript';

import { NewPageSchema } from './schema';
// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function newPage(options: NewPageSchema): Rule {
  return (tree: Tree) => {
    let workspaceConfig: any = tree.read('/angular.json');
    if (!workspaceConfig) {
      throw new SchematicsException('Could not find Angular workspace configuration');
    }

    // convert workspace to string
    const workspaceContent = workspaceConfig.toString();

    // 解析出專案的正確路徑與檔名
    workspaceConfig = JSON.parse(workspaceContent.toString());
    const projectName = options.project || workspaceConfig.defaultProject;
    const project = workspaceConfig.projects[projectName];
    const defaultProjectPath = buildDefaultPath(project);
    const parsePath = parseName(defaultProjectPath, options.name);
    const { name, path } = parsePath;

    // 建立檔案(template)，並移動到對的位置。
    const templateSource = apply(url('./files'), [
      applyTemplates({
        classify: strings.classify,
        dasherize: strings.dasherize,
        name,
      }),
      move(normalize(path)),
    ]);
    // console.log('-------------');
    // console.log(defaultProjectPath);
    //#region 更新app-routing.module.ts
    // 取得routing.module的位置
    const routingModulePath = `${defaultProjectPath}/app-routing.module.ts`;
    // 將 routing.module 的程式碼讀取出來
    const text = tree.read(routingModulePath) || [];
    const sourceFile = ts.createSourceFile(
      'test.ts',
      text.toString(), // 轉成字串後丟進去以產生檔案，方便後續操作
      ts.ScriptTarget.Latest,
      true
    );
    // 取得routes值得宣告資訊
    const initializerExpression = (sourceFile.statements.find((item) => {
      return (
        item.kind === ts.SyntaxKind.VariableStatement &&
        ((item as ts.VariableStatement).declarationList.declarations[0].name as ts.Identifier).escapedText === 'routes'
      );
    }) as ts.VariableStatement).declarationList.declarations[0].initializer as ts.ArrayLiteralExpression;

    // console.log('--------------------', temp.elements);
    // console.log(temp.declarationList.declarations);
    // console.log(sourceFile.statements.map((item) => item.kind));
    // console.log(temp.getText());
    // console.log(temp.end);

    // return chain([mergeWith(templateSource)]);

    //#region 更新routing.module的routes
    const declarationRecorder = tree.beginUpdate(routingModulePath);

    // 取得routing-module與pageModule的相對位置
    const relativePath = buildRelativePath(
      routingModulePath,
      `${path}/${strings.dasherize(name)}/${strings.dasherize(name)}.module`
    );
    // console.log('relativePath', relativePath);
    // console.log('hasTrailingComma', initializerExpression.elements.hasTrailingComma);
    // 在原本的 Identifier 結尾的地方加上 router 字串
    declarationRecorder.insertLeft(
      initializerExpression.elements.end,
      `${
        initializerExpression.elements.hasTrailingComma ||
        typeof initializerExpression.elements.hasTrailingComma === 'undefined'
          ? ''
          : ', '
      }{ path: '${strings.dasherize(
        name
      )}', loadChildren: () => import('${relativePath}').then((m) => m.${strings.classify(name)}Module), }`
    );

    // 把變更記錄提交給 Tree ， Tree 會自動幫我們變更
    tree.commitUpdate(declarationRecorder);
    //#endregion
    // 顯示routingModulePath更新後的內容
    // console.log(tree.read(routingModulePath)!.toString());
    //#endregion
    return chain([mergeWith(templateSource)]);
  };
}
