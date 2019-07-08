


# 新增libirary
ng g library <name> 

# 設定package
package.json name要加@goldenapple

# 設定移除不必要的檔案(可以不做)
到<name>/src/lib裡面移除掉沒用到的檔案，例如這是個component套件，則service.ts就可以移除
到<name>/public-api.ts裡面移除沒用到的程式碼，例如這是service套件，則只保留export * from './lib/<name>.service';

# 編譯
npm build <name>

# 發佈到npm
cd dist/<name>
npm publish --access public