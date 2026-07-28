import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
//  ギャラリーのモザイクタイルの「中身」を、スクロールに合わせて縦にずらす。
//
//  動かすのは枠 (.gallery-tile) ではなく中身 (.gallery-tile__inner)。
//  タイル同士は gap 0 で密着しているので、枠を動かすと必ず隣と重なる。
//  中身は枠より --overscan だけ縦に大きく、枠の overflow:hidden で切り取られる
//  ため、どれだけ速度差をつけても破綻しない。
//
//  動く量そのものは CSS が持っている (--speed / --speed-scale)。タイルの大小と
//  動きの強さはセットで決めたいので、ブレークポイントごとの値は layout.css 側に
//  置き、ここではそれを読んで --py を動かすだけにする。
//
//  --py を transform ではなく CSS の translate プロパティに載せているのは、
//  ホバーの拡大が __inner の transform を使っていて、共有すると潰し合うため。
//  translate は transform とは独立したプロパティなので干渉しない。
//
//  タイルごとに tween を張るのではなく、1 本の ScrollTrigger の progress から
//  全タイルの値をその場で計算している。tween だと同じ --speed のタイル同士でも
//  開始値を評価するタイミングがずれて数 px ずれるため。
// ─────────────────────────────────────────────

// その中身がスクロール中に移動する総量 (px)。--speed は枠側で定義されていて、
// 継承で中身からも読める。
function travel(inner) {
  const cs = getComputedStyle(inner);
  const speed = parseFloat(cs.getPropertyValue("--speed")) || 0;
  const scale = parseFloat(cs.getPropertyValue("--speed-scale")) || 1;
  return speed * scale;
}

// 見出し「銭湯の世界へ」の下線を、見出しが画面に入ったところで左から引く。
// 筆を一度走らせる感じにしたいので、往復させず once で 1 回だけ。
export function initGalleryHeading() {
  if (window.__reducedMotion) return;

  // gsap.from を onEnter の中で組み立てる。scrollTrigger を tween に直接
  // ぶら下げると開始値 (scaleX:0) が即座に適用され、トリガーが発火しなかった
  // ときに下線が消えたままになるため。発火するまでは CSS 既定の等倍。
  document.querySelectorAll(".lead-heading__wrap").forEach((wrap) => {
    const rule = wrap.querySelector(".lead-heading__rule");
    if (!rule) return;

    ScrollTrigger.create({
      trigger: wrap,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.from(rule, {
          scaleX: 0,
          duration: 1.1,
          // 書き出しは速く、終わりでゆっくり止まる。
          ease: "power3.out",
          // 文字のフェードイン（reveal 側）が立ち上がってから引きたい。
          delay: 0.25,
        });
      },
    });
  });
}

export function initGalleryParallax() {
  if (window.__reducedMotion) return;

  const section = document.querySelector(".gallery-section");
  const tiles = [...(section?.querySelectorAll(".gallery-tile__inner") ?? [])];
  if (!section || !tiles.length) return;

  // getComputedStyle は毎フレーム回すには重いので、距離は refresh 時にだけ測る。
  let distances = [];
  const measure = () => {
    distances = tiles.map(travel);
  };

  // progress 0.5（セクションが画面中央）で offset 0 ＝ 本来のレイアウト位置。
  // 向きは全タイル揃えて速さだけを変えている。隣同士を逆向きに動かすと
  // gap を食い潰して重なるため。
  const apply = (progress) => {
    const t = 0.5 - progress;
    tiles.forEach((tile, i) => {
      tile.style.setProperty("--py", `${t * distances[i]}px`);
    });
  };

  ScrollTrigger.create({
    trigger: section,
    start: "top bottom",   // セクションの上端が画面下に触れた瞬間から
    end: "bottom top",     // 下端が画面上に抜けるまで
    // リサイズやタブ切替で refresh() が走ったら、ブレークポイントが
    // 変わっているかもしれないので --speed を測り直す。初回もここを通る。
    // ここで apply も呼んでおかないと、セクションに入る瞬間まで --py が 0 の
    // ままになり、画面下端に現れた瞬間に開始位置まで飛ぶ。
    onRefresh: (self) => {
      measure();
      apply(self.progress);
    },
    onUpdate: (self) => apply(self.progress),
  });
}
