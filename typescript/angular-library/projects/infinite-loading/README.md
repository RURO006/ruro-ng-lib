# 使用方法

module.ts
imports: [InfiniteLoadingModule],

.html
<div #infiniteLoadingName="InfiniteLoadingDirective"
  InfiniteLoading
  (infiniteLoadData)="infiniteLoadData()">
    <div class="item" *ngFor="let item of itemList">
        {{ item.title }}
    </div>
    <div class="item" *ngIf="needLoading">
        我是loading動畫
    </div>
</div>

.ts
itemList=[];
needLoading=true;
@ViewChild("infiniteLoadingName") infiniteLoadingName: InfiniteLoadingDirective;
infiniteLoadData() {
    if (!this.needLoadingneedLoading) {
        return;
    }
    // TODO: 需要載入新資料
    this.itemList.push(data);
    // TODO: 需要判斷後續是否還有資料
    this.needLoading=false;
}