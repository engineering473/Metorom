export type LandingCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  heroScroll: string;
  heroProduct: string;
  overviewLabel: string;
  overviewTitle: string;
  overviewBody: string;
  missionLabel: string;
  missionTitle: string;
  missionIntro: string;
  missions: { number: string; kicker: string; title: string; body: string }[];
  valuesLabel: string;
  valuesTitle: string;
  values: { number: string; kicker: string; title: string; intro: string; points: string[] }[];
  visionLabel: string;
  visionTitle: string;
  visionIntro: string;
  visions: { word: string; title: string; body: string }[];
  visionCloseTitle: string;
  visionCloseBody: string;
  japanLabel: string;
  japanTitle: string;
  japanIntro: string;
  japanPoints: { number: string; title: string; body: string }[];
  productLabel: string;
  productTitle: string;
  productBody: string;
  productLink: string;
  contactLink: string;
  footerTag: string;
};

export const LANDING_COPY = {
  en: {
    metaTitle: "metorom — People, sound, and space in resonance",
    metaDescription: "metorom explores acoustic space design from Kyoto, bringing people, sound, and space into resonance through human-centered and modular design.",
    eyebrow: "ACOUSTIC SPACE DESIGN / KYOTO, JAPAN",
    heroTitle: "People, sound,\nand space in resonance.",
    heroBody: "We design the relationships between people, sound, and space. Toward a world where everyone can feel at ease and excited by life.",
    heroScroll: "Scroll to find our rhythm",
    heroProduct: "Explore Ground Sound I",
    overviewLabel: "BUSINESS OVERVIEW",
    overviewTitle: "A world where\nsound is beautiful.",
    overviewBody: "metorom is an acoustic space design project. We tune the sound environment, the distance, and the resonance to make room for the way people actually live, move, and listen.",
    missionLabel: "CONCEPT / MISSION",
    missionTitle: "Beyond the\nstimulation society.",
    missionIntro: "Sound is always with us. We begin by listening to what it does to people.",
    missions: [
      {
        number: "01",
        kicker: "THE CURRENT ERA",
        title: "Unsettled resonance.",
        body: "Globalized, digitalized, and driven by consumption, our world keeps accelerating. Everything arrives at once. Stimulation can delight us, yet too much of it quietly disturbs the harmony of our senses. We call this the stimulation society.",
      },
      {
        number: "02",
        kicker: "SOUND AND HUMANITY",
        title: "The ears have\nno off switch.",
        body: "The acoustic environment reaches deep into our physiology and emotions. We tune sound, distance, and resonance with this in mind, working toward a world of sound in which anyone can live with both ease and excitement.",
      },
      {
        number: "03",
        kicker: "THE IDEAL WORLD",
        title: "People. Sound. Space.\nIn resonance.",
        body: "When people, sound, and space resonate naturally, our ears open to the presence of others. Ambient sound can become part of that connection. Shared experiences emerge, and a blissful time begins.",
      },
    ],
    valuesLabel: "CONCEPT / VALUE",
    valuesTitle: "Design begins\nwith being human.",
    values: [
      {
        number: "01",
        kicker: "HUMAN CENTERED DESIGN",
        title: "Cherishing humanity.",
        intro: "A human-centered perspective is the starting point of everything we create.",
        points: [
          "Study and compare the movements of people and nature, bringing their essential qualities into design.",
          "Bring CNC and 3D printing together with handcraftsmanship and the sensitivity of traditional arts.",
          "Keep creating for functionality, comfort, and sustainability, so that what we make truly fits human life.",
        ],
      },
      {
        number: "02",
        kicker: "MODULAR SOUND DESIGN",
        title: "Sound that moves\nwith people.",
        intro: "Adapt sound to people. People sit, stand, turn, and listen with ears on both sides. Yet many acoustic spaces are designed around the assumption that listeners stay still.",
        points: [
          "Start with people in motion and the changing ways they inhabit a space.",
          "Treat the relationship between people and space as blocks that can be freely rearranged.",
          "This is our technical philosophy: Modular Acoustic Design.",
        ],
      },
    ],
    visionLabel: "CONCEPT / VISION",
    visionTitle: "We are made\nto ride the waves.",
    visionIntro: "Sound carries a rhythm between what has been, what is here, and what comes next.",
    visions: [
      {
        word: "Play",
        title: "To play.",
        body: "Ride the wave as it arrives. In that movement, the human capacity to play comes naturally.",
      },
      {
        word: "Replay",
        title: "To listen again.",
        body: "Tune your ears to soundwaves reaching you from the past. Depth, direction, and color begin to emerge.",
      },
      {
        word: "Perform",
        title: "To give it form.",
        body: "Carry that wave forward. It quietly connects the present to the future.",
      },
    ],
    visionCloseTitle: "Toward a world where\nsound is beautiful.",
    visionCloseBody: "We are working toward a world of sound where everyone can live a relaxed and exciting life.",
    japanLabel: "OUR RESONATING BODY",
    japanTitle: "Japan,\nin resonance.",
    japanIntro: "Our work begins here, with the sensitivities that continue to resonate through everyday life in Japan.",
    japanPoints: [
      {
        number: "01",
        title: "The power to select and nurture.",
        body: "An island nation in the East, Japan has selected, nurtured, and preserved beautiful frequencies from across the world. That capacity to receive and make something one's own is part of our inspiration.",
      },
      {
        number: "02",
        title: "Sensitivity in the depths.",
        body: "Tradition, artisans, Kyoto cuisine, nature, food, and art: delicate sensitivities still live deep within society. We listen for the qualities they hold.",
      },
      {
        number: "03",
        title: "Our role is to amplify.",
        body: "Amplify the warm frequencies residing in Japan, and carry them to the places where they are needed.",
      },
    ],
    productLabel: "PHILOSOPHY, GIVEN A SHAPE",
    productTitle: "Meet Ground Sound I.",
    productBody: "Explore our evolving three-way loudspeaker: its modular construction, design process, measurements, and listening context.",
    productLink: "Explore the product",
    contactLink: "Start a conversation",
    footerTag: "ACOUSTIC SPACE DESIGN / KYOTO",
  },
  ja: {
    metaTitle: "metorom — 人と、音と、空間が響きあう。",
    metaDescription: "京都を拠点に、人と、音と、空間の関係を考えるmetorom。人間中心の視点とモジュラー音響設計から、誰もがくつろぎ、心躍る音の世界を目指します。",
    eyebrow: "音響空間デザイン / KYOTO, JAPAN",
    heroTitle: "人と、音と、\n空間が響きあう。",
    heroBody: "人と、音と、空間の関係をデザインする。誰もがくつろぎ、心躍る日々を過ごせる世界へ。",
    heroScroll: "スクロールして、私たちのリズムへ",
    heroProduct: "Ground Sound Iを見る",
    overviewLabel: "BUSINESS OVERVIEW / 事業概要",
    overviewTitle: "音が美しい、\n世界へ。",
    overviewBody: "metoromは、音響空間をデザインするプロジェクトです。人が暮らし、動き、耳を澄ます姿を起点に、音の環境、距離、響きを整えます。",
    missionLabel: "CONCEPT / MISSION",
    missionTitle: "刺激社会の、\nその先へ。",
    missionIntro: "音は、いつも私たちとともにある。その音が人にもたらすものに、耳を澄ますことから始めます。",
    missions: [
      {
        number: "01",
        kicker: "THE CURRENT ERA / 現代という時代",
        title: "落ち着かない、\n響きのなかで。",
        body: "グローバル化、デジタル化、消費に駆動され、あらゆるものが加速し、一度に押し寄せる時代。刺激は人を喜ばせる一方、過剰になると感覚の調和を静かに乱していきます。私たちはこの状態を「刺激社会」と捉えています。",
      },
      {
        number: "02",
        kicker: "SOUND AND HUMANITY / 音と人間",
        title: "耳に、\nオフスイッチはない。",
        body: "音の環境は、人の生理や感情に深く働きかけます。だからこそ、音と距離と響きを整える。誰もがくつろぎ、心躍る生活を送れる音の世界を、私たちは実現していきます。",
      },
      {
        number: "03",
        kicker: "THE IDEAL WORLD / 目指す世界",
        title: "人と、音と、\n空間の共鳴。",
        body: "人と、音と、空間が自然に響きあうことで、耳が開き、互いの気配を感じられるようになる。周囲の音も、そのつながりの一部になる。そこから分かち合いが生まれ、至福の時間が始まります。",
      },
    ],
    valuesLabel: "CONCEPT / VALUE",
    valuesTitle: "人間らしさを、\nデザインの起点に。",
    values: [
      {
        number: "01",
        kicker: "HUMAN CENTERED DESIGN",
        title: "人間らしさを、\n大切にする。",
        intro: "すべての創造の出発点に、人を中心とする視点を置きます。",
        points: [
          "人や自然の動きを深く観察し、分析し、比較する。その本質的な価値をデザインへ取り入れる。",
          "CNCや3Dプリントなどの先端技術と、手仕事の技、伝統芸術の感性を融合する。",
          "機能性、心地よさ、持続可能性を追求し、人の暮らしに本当にふさわしいデザインをつくり続ける。",
        ],
      },
      {
        number: "02",
        kicker: "MODULAR SOUND DESIGN",
        title: "人の動きに、\n音を合わせる。",
        intro: "空間に人を合わせるのではなく、人に音を合わせる。人は座り、立ち、向きを変え、左右の耳で聴いています。それでも、多くの音響空間は「人が動かない」ことを前提につくられています。",
        points: [
          "動き続ける人と、移り変わる空間の使われ方から考える。",
          "人と空間の関係を、自由に組み替えられるブロックとしてデザインする。",
          "それが、私たちの技術思想「モジュラー音響設計」です。",
        ],
      },
    ],
    visionLabel: "CONCEPT / VISION",
    visionTitle: "人は、本来、\n波に乗る存在。",
    visionIntro: "過去から、いまへ。そして、これからへ。音は、そのあいだにリズムを運んでいます。",
    visions: [
      {
        word: "Play",
        title: "遊ぶ。",
        body: "やってくる波に乗ることで、人は自然と「遊ぶ」存在になる。",
      },
      {
        word: "Replay",
        title: "聴きなおす。",
        body: "過去から届く音の波に耳を澄ます。奥行きや方向、色彩が浮かびあがる。",
      },
      {
        word: "Perform",
        title: "奏でる。",
        body: "その波を、先へ。その波が静かに、現在と未来をつないでいく。",
      },
    ],
    visionCloseTitle: "音が美しい、\n世界へ。",
    visionCloseBody: "誰もがくつろぎ、心躍る生活を送れる音の世界を、私たちは実現していきます。",
    japanLabel: "OUR RESONATING BODY / 私たちの共鳴体",
    japanTitle: "共鳴体としての、\n日本。",
    japanIntro: "私たちの仕事は、この場所から。日本の日々の営みに響き続ける感性に、耳を澄ませて。",
    japanPoints: [
      {
        number: "01",
        title: "選び、育み、受け取る力。",
        body: "東にある島国として、世界の美しい周波数を選び、育み、受け継いできた場所。外から受け取り、自らのものにしていく力に、私たちは着想を得ています。",
      },
      {
        number: "02",
        title: "奥底に根づく、感性。",
        body: "伝統、職人、京料理、自然、食、芸術。社会の奥底には、いまも繊細な感性が息づいています。そこに宿る質感を、丁寧に聴き取ります。",
      },
      {
        number: "03",
        title: "あたたかな周波数を、増幅する。",
        body: "この日本に宿るあたたかな周波数を増幅し、それを必要とする場所へ届けていく。それが、私たちの役割です。",
      },
    ],
    productLabel: "PHILOSOPHY, GIVEN A SHAPE / 思想を、かたちに",
    productTitle: "Ground Sound I。",
    productBody: "進化を続ける3ウェイ・ラウドスピーカー。そのモジュラー構造、デザインの過程、測定、リスニングへの考え方をご覧ください。",
    productLink: "プロダクトを見る",
    contactLink: "対話をはじめる",
    footerTag: "音響空間デザイン / 京都",
  },
} satisfies Record<"en" | "ja", LandingCopy>;
