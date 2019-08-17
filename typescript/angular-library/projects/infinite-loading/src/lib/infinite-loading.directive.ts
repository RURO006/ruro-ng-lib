import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  Output,
  EventEmitter
} from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";

@Directive({
  selector: "[InfiniteLoading]",
  exportAs: "InfiniteLoadingDirective"
})
export class InfiniteLoadingDirective implements AfterViewInit {
  /**
   * 判斷需要讀取的最小距離
   */
  @Input() triggerHeight = 50;
  /**
   * 需要讀取時機點，停止滑動持續300ms後觸發。
   */
  @Input() idleDelayTime = 300;
  @Output() infiniteLoadData = new EventEmitter();
  subscribe: Subscription;
  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    this.initScroll();
  }

  initScroll() {
    const box = this.el.nativeElement;
    const scrollObservable = fromEvent(box, "scroll");
    this.subscribe = scrollObservable
      .pipe(
        debounceTime(this.idleDelayTime),
        filter(() => this.checkScroll())
      )
      .subscribe(() => {
        if (this.checkScroll()) {
          this.infiniteLoadData.emit();
        }
      });
  }

  /**
   * 檢查是否有達到需要載入的範圍
   */
  checkScroll() {
    const box = this.el.nativeElement;
    return (
      box.scrollHeight - (box.clientHeight + box.scrollTop) < this.triggerHeight
    );
  }

  unsubscribe() {
    this.subscribe.unsubscribe();
  }
}
