/*
 * Vehicle inventory — single source of truth for the static site.
 * The future .NET app replaces this file with an API returning the same shapes.
 * Schema and update procedure: .claude/skills/add-vehicle/SKILL.md
 *
 * Image folders: assets/images/vehicles/<make>/<model>/<YYYYMMDD-HHmm>/NN.jpg
 * (timestamp = Instagram post time, Tehran time, UTC+03:30). id = <make>-<model>-<YYYYMMDD-HHmm>.
 */
window.SITE = {
  brandFa: "طالبی اتوموتیو",
  brandEn: "TALEBI JDM AUTOMOTIVE",
  owner: "امیر طالبی",
  phone: "09124492960",
  phoneIntl: "+989124492960",
  phoneFa: "۰۹۱۲ ۴۴۹ ۲۹۶۰",
  city: "تهران",
  address: "تهران، شهرک آپادانا",
  // showroom location (from https://maps.app.goo.gl/Kq4b5519e7Vc4SG16): embed pin + directions link
  mapQuery: "35.711011,51.328319",
  mapLink: "https://maps.app.goo.gl/Kq4b5519e7Vc4SG16",
  currency: "تومان",
  // Home hero: drop a video at hero.video (mp4, muted autoplay loop). Until then the poster image is shown.
  // The poster is set into a dark showroom (whole car, edges faded); focusY = the car's vertical centre
  // in the photo, in % of its height. Pick a photo where the whole car is in frame.
  hero: {
    video: "assets/videos/hero_02.mp4",
    poster: "assets/images/vehicles/honda/accord/20260812-1908/00.jpg",
    focusY: 62,
    carId: "honda-accord-20260812-1908"
  },
  // Home category tiles: non-stock visuals. Page photos are placeholders (see assets/images/pages/CREDITS.md).
  tiles: {
    availableVideo: "assets/videos/hero_01.mp4",
    gallery: "assets/images/pages/gallery.jpg",
    about: "assets/images/pages/about.jpg"
  },
  // Home intro (dark showroom band under the hero): one car photo sunk into the dark, straight-on rear view.
  intro: {
    image: "assets/images/vehicles/mazda/323/20260803-1145/01.jpg",
    focusY: 70
  },
  // brand logos in assets/images/makes; invert: logo is black-on-transparent and needs inverting in dark mode
  logos: {
    Honda: { src: "assets/images/makes/honda-logo.png" },
    Hyundai: { src: "assets/images/makes/hyundai-logo.png" },
    Daewoo: { src: "assets/images/makes/daewoo-logo.png" },
    Mazda: { src: "assets/images/makes/mazda-logo.png" },
    Opel: { src: "assets/images/makes/opel-logo.png", invert: true }
  }
};

window.VEHICLES = [
  {
    id: "hyundai-verna-20261013-2025",
    status: "available",
    featured: true,
    make: { fa: "هیوندای", en: "Hyundai" },
    model: { fa: "ورنا", en: "Verna" },
    trim: "",
    year: 1388, calendar: "jalali",
    color: "مشکی", transmission: "اتومات", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 1280000000,
    insuranceMonths: 6, inspectionMonths: 6, tiresPercent: 60,
    condition: {
      body: "سقف و ستون بدون رنگ، بدنه رنگ‌شده بدون خط و خش",
      chassis: "شاسی‌ها سالم",
      cabin: "بدون صدا و بدون پارگی",
      electrics: "کولر، آمپرها و تمامی ادوات برقی فعال",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: "زیربندی سرویس‌شده"
    },
    features: [],
    description: "هیوندای ورنا مدل ۱۳۸۸ با گیربکس اتومات؛ سقف و ستون‌ها بدون رنگ، شاسی سالم و موتور و گیربکس بی‌نقص.",
    images: [
      "assets/images/vehicles/hyundai/verna/20261013-2025/00.jpg",
      "assets/images/vehicles/hyundai/verna/20261013-2025/01.jpg",
      "assets/images/vehicles/hyundai/verna/20261013-2025/02.jpg",
      "assets/images/vehicles/hyundai/verna/20261013-2025/03.jpg",
      "assets/images/vehicles/hyundai/verna/20261013-2025/04.jpg",
      "assets/images/vehicles/hyundai/verna/20261013-2025/05.jpg"
    ],
    source: "https://www.instagram.com/p/DecSXk_lH6x/",
    postedAt: "2026-10-13T20:25+03:30",
    soldAt: null,
    seo: {
      title: "هیوندای ورنا ۱۳۸۸ اتومات مشکی | طالبی اتوموتیو",
      description: "هیوندای ورنا مدل ۱۳۸۸ اتومات، سقف و ستون بدون رنگ، فنی سالم، بیمه و معاینه ۶ ماه. بازدید در تهران، شهرک آپادانا."
    }
  },
  {
    id: "honda-accord-20260723-2019",
    status: "available",
    featured: true,
    make: { fa: "هوندا", en: "Honda" },
    model: { fa: "آکورد", en: "Accord" },
    trim: "EX انژکتور",
    year: 1993, calendar: "gregorian",
    color: "نقره‌ای", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 1150000000,
    insuranceMonths: 12, inspectionMonths: 3, tiresPercent: 60,
    condition: {
      body: "دور رنگ، بدون خط و خش و بدون موج",
      chassis: "",
      cabin: "کاملاً سالم، بدون پارگی و بدون صدا",
      electrics: "آمپر، سیم‌کشی‌ها و تمامی ادوات برقی کاملاً سالم",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: ""
    },
    features: [],
    description: "هوندا آکورد EX انژکتور مدل ۱۹۹۳؛ بدنه بدون خط و خش و موج، کابین کاملاً سالم و بیمه ۱۲ ماه.",
    images: [
      "assets/images/vehicles/honda/accord/20260723-2019/00.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/01.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/02.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/03.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/04.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/05.jpg",
      "assets/images/vehicles/honda/accord/20260723-2019/06.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DbJIgFlDv5n/",
    postedAt: "2026-07-23T20:19+03:30",
    soldAt: null,
    seo: {
      title: "هوندا آکورد EX انژکتور ۱۹۹۳ | طالبی اتوموتیو",
      description: "هوندا آکورد EX انژکتور مدل ۱۹۹۳ نقره‌ای، بدنه بدون موج، کابین سالم، بیمه ۱۲ ماه. بازدید در تهران، شهرک آپادانا."
    }
  },
  {
    id: "honda-accord-20260711-1959",
    status: "available",
    coverIndex: 2,
    featured: true,
    make: { fa: "هوندا", en: "Honda" },
    model: { fa: "آکورد", en: "Accord" },
    trim: "EXi انژکتور",
    year: 1991, calendar: "gregorian",
    color: "نقره‌ای", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 1180000000,
    insuranceMonths: 7, inspectionMonths: 8, tiresPercent: 100,
    condition: {
      body: "چند لکه رنگ، بدون ضربه",
      chassis: "شاسی‌ها و سینی بدون ضربه",
      cabin: "بدون پارگی و بدون صدا",
      electrics: "کولر، سانروف، سیم‌کشی و تمامی ادوات برقی فعال",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: ""
    },
    features: ["سانروف"],
    description: "هوندا آکورد EXi انژکتور مدل ۱۹۹۱ با سانروف فعال؛ شاسی و سینی بدون ضربه و لاستیک‌های نو.",
    images: [
      "assets/images/vehicles/honda/accord/20260711-1959/00.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/01.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/02.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/03.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/04.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/05.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/06.jpg",
      "assets/images/vehicles/honda/accord/20260711-1959/07.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DaqMpXtDr0m/",
    postedAt: "2026-07-11T19:59+03:30",
    soldAt: null,
    seo: {
      title: "هوندا آکورد EXi انژکتور ۱۹۹۱ | طالبی اتوموتیو",
      description: "هوندا آکورد EXi انژکتور مدل ۱۹۹۱ با سانروف، شاسی بدون ضربه، لاستیک ۱۰۰٪. بازدید در تهران، شهرک آپادانا."
    }
  },
  {
    id: "honda-accord-20260916-2207",
    status: "sold",
    featured: false,
    make: { fa: "هوندا", en: "Honda" },
    model: { fa: "آکورد", en: "Accord" },
    trim: "EXi",
    year: 1991, calendar: "gregorian",
    color: "شکلاتی", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 1450000000,
    insuranceMonths: 4, inspectionMonths: 10, tiresPercent: 80,
    condition: {
      body: "رنگ‌شده بدون بتونه، بدون خط و خش و موج",
      chassis: "شاسی، سینی و پالونی‌ها بدون ضربه",
      cabin: "موکا، بدون پارگی و بدون صدا",
      electrics: "کولر، آمپر، سیم‌کشی‌ها و تمامی ادوات برقی فابریک",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: "زیربندی و تمامی سرویس‌های دوره‌ای انجام‌شده"
    },
    features: ["سانروف", "صندلی برقی", "کروز کنترل"],
    description: "هوندا آکورد EXi مدل ۱۹۹۱ شکلاتی با سانروف، صندلی برقی و کروز کنترل فعال و سرویس‌های دوره‌ای کامل.",
    images: [
      "assets/images/vehicles/honda/accord/20260916-2207/00.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/01.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/02.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/03.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/04.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/05.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/06.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/07.jpg",
      "assets/images/vehicles/honda/accord/20260916-2207/08.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DdW8f-sjHxF/",
    postedAt: "2026-09-16T22:07+03:30",
    soldAt: null,
    seo: {
      title: "هوندا آکورد EXi ۱۹۹۱ شکلاتی — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: هوندا آکورد EXi مدل ۱۹۹۱ شکلاتی با سانروف، صندلی برقی و کروز کنترل."
    }
  },
  {
    id: "daewoo-cielo-20260916-2030",
    status: "sold",
    coverIndex: 1,
    featured: false,
    make: { fa: "دوو", en: "Daewoo" },
    model: { fa: "سیلو", en: "Cielo" },
    trim: "",
    year: 1381, calendar: "jalali",
    color: "بژ متالیک", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 690000000,
    insuranceMonths: 5, inspectionMonths: 12, tiresPercent: 70,
    condition: {
      body: "دو تکه رنگ‌شدگی",
      chassis: "شاسی، سینی و پالونی‌ها بدون ضربه",
      cabin: "فابریک، بدون پارگی و بدون صدا",
      electrics: "کولر، سیم‌کشی و تمامی ادوات برقی کاملاً سالم و فعال",
      engine: "موتور و گیربکس تازه تعمیر و بدون عیب",
      suspension: "زیربندی سرویس‌شده"
    },
    features: [],
    description: "دوو سیلو مدل ۱۳۸۱ با کابین فابریک و موتور و گیربکس تازه تعمیر.",
    images: [
      "assets/images/vehicles/daewoo/cielo/20260916-2030/00.jpg",
      "assets/images/vehicles/daewoo/cielo/20260916-2030/01.jpg",
      "assets/images/vehicles/daewoo/cielo/20260916-2030/02.jpg",
      "assets/images/vehicles/daewoo/cielo/20260916-2030/03.jpg",
      "assets/images/vehicles/daewoo/cielo/20260916-2030/04.jpg",
      "assets/images/vehicles/daewoo/cielo/20260916-2030/05.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DdWxgGaDPBM/",
    postedAt: "2026-09-16T20:30+03:30",
    soldAt: null,
    seo: {
      title: "دوو سیلو ۱۳۸۱ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: دوو سیلو مدل ۱۳۸۱، کابین فابریک، موتور و گیربکس تازه تعمیر."
    }
  },
  {
    id: "honda-accord-20260913-2127",
    status: "sold",
    coverIndex: 3,
    featured: false,
    make: { fa: "هوندا", en: "Honda" },
    model: { fa: "آکورد", en: "Accord" },
    trim: "EXi انژکتور",
    year: 1992, calendar: "gregorian",
    color: "سفید", transmission: "اتومات", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 1190000000,
    insuranceMonths: 8, inspectionMonths: null, tiresPercent: 70,
    condition: {
      body: "چند تکه رنگ‌شدگی بدون ضربه، سقف و ستون بدون رنگ",
      chassis: "شاسی و پالونی‌ها سالم",
      cabin: "بدون پارگی و بدون صدا",
      electrics: "کولر، صندلی برقی، سانروف، بالابرها، سیم‌کشی و تمامی ادوات برقی فابریک",
      engine: "",
      suspension: "زیربندی سرویس‌شده، بدون ضعف"
    },
    features: ["رینگ فابریک هوندا", "سانروف", "صندلی برقی", "بالابر برقی"],
    description: "هوندا آکورد EXi اتومات مدل ۱۹۹۲ با رینگ فابریک هوندا، سانروف و صندلی برقی؛ سقف و ستون بدون رنگ.",
    images: [
      "assets/images/vehicles/honda/accord/20260913-2127/00.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/01.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/02.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/03.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/04.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/05.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/06.jpg",
      "assets/images/vehicles/honda/accord/20260913-2127/07.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DdPJmU8jLB9/",
    postedAt: "2026-09-13T21:27+03:30",
    soldAt: null,
    seo: {
      title: "هوندا آکورد EXi اتومات ۱۹۹۲ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: هوندا آکورد EXi اتومات مدل ۱۹۹۲ سفید با رینگ فابریک، سانروف و صندلی برقی."
    }
  },
  {
    id: "proton-wira-20260910-1406",
    status: "sold",
    coverIndex: 3,
    featured: false,
    make: { fa: "پروتون", en: "Proton" },
    model: { fa: "ویرا", en: "Wira" },
    trim: "لیفت‌بک",
    year: 1385, calendar: "jalali",
    color: "سفید", transmission: "", fuel: "بنزینی", body: "لیفت‌بک",
    mileageKm: null,
    price: 590000000,
    insuranceMonths: 4, inspectionMonths: 12, tiresPercent: 80,
    condition: {
      body: "دو تکه رنگ‌شدگی",
      chassis: "",
      cabin: "فابریک",
      electrics: "کولر، سیم‌کشی و تمامی ادوات برقی کاملاً سالم",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: ""
    },
    features: [],
    description: "پروتون ویرا لیفت‌بک مدل ۱۳۸۵ با کابین فابریک و فنی کاملاً سالم.",
    images: [
      "assets/images/vehicles/proton/wira/20260910-1406/00.jpg",
      "assets/images/vehicles/proton/wira/20260910-1406/01.jpg",
      "assets/images/vehicles/proton/wira/20260910-1406/02.jpg",
      "assets/images/vehicles/proton/wira/20260910-1406/03.jpg",
      "assets/images/vehicles/proton/wira/20260910-1406/04.jpg",
      "assets/images/vehicles/proton/wira/20260910-1406/05.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DdGouMpjANC/",
    postedAt: "2026-09-10T14:06+03:30",
    soldAt: null,
    seo: {
      title: "پروتون ویرا لیفت‌بک ۱۳۸۵ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: پروتون ویرا لیفت‌بک مدل ۱۳۸۵، کابین فابریک، موتور و گیربکس سالم."
    }
  },
  {
    id: "honda-accord-20260812-1908",
    status: "sold",
    coverIndex: 2,
    featured: false,
    make: { fa: "هوندا", en: "Honda" },
    model: { fa: "آکورد", en: "Accord" },
    trim: "EX",
    year: 1993, calendar: "gregorian",
    color: "نوک‌مدادی", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 790000000,
    insuranceMonths: 2, inspectionMonths: 5, tiresPercent: 80,
    condition: {
      body: "کامل رنگ",
      chassis: "شاسی، سینی و پالونی‌ها بدون ضربه",
      cabin: "بدون پارگی و بدون صدا",
      electrics: "سیم‌کشی، آمپرها و تمامی ادوات برقی فابریک",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: ""
    },
    features: [],
    description: "هوندا آکورد EX مدل ۱۹۹۳ با شاسی بدون ضربه و ادوات برقی فابریک.",
    images: [
      "assets/images/vehicles/honda/accord/20260812-1908/00.jpg",
      "assets/images/vehicles/honda/accord/20260812-1908/01.jpg",
      "assets/images/vehicles/honda/accord/20260812-1908/02.jpg",
      "assets/images/vehicles/honda/accord/20260812-1908/03.jpg",
      "assets/images/vehicles/honda/accord/20260812-1908/04.jpg",
      "assets/images/vehicles/honda/accord/20260812-1908/05.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/Db8gSCODnOo/",
    postedAt: "2026-08-12T19:08+03:30",
    soldAt: null,
    seo: {
      title: "هوندا آکورد EX ۱۹۹۳ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: هوندا آکورد EX مدل ۱۹۹۳، شاسی بدون ضربه، ادوات برقی فابریک."
    }
  },
  {
    id: "proton-wira-20260810-1152",
    status: "sold",
    featured: false,
    make: { fa: "پروتون", en: "Proton" },
    model: { fa: "ویرا", en: "Wira" },
    trim: "لیفت‌بک",
    year: 1382, calendar: "jalali",
    color: "مشکی", transmission: "", fuel: "بنزینی", body: "لیفت‌بک",
    mileageKm: 100000,
    price: 740000000,
    insuranceMonths: 10, inspectionMonths: null, tiresPercent: 90,
    condition: {
      body: "۴ لکه رنگ جزئی",
      chassis: "شاسی‌ها، سینی و پالونی بدون ضربه",
      cabin: "کاملاً فابریک",
      electrics: "کولر، سیم‌کشی، آمپرها و تمامی ادوات برقی فعال",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: ""
    },
    features: [],
    description: "پروتون ویرا لیفت‌بک مدل ۱۳۸۲ با کارکرد ۱۰۰ هزار کیلومتر و کابین کاملاً فابریک.",
    images: [
      "assets/images/vehicles/proton/wira/20260810-1152/00.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/01.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/02.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/03.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/04.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/05.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/06.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/07.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/08.jpg",
      "assets/images/vehicles/proton/wira/20260810-1152/09.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/Db2kuTuFgaD/",
    postedAt: "2026-08-10T11:52+03:30",
    soldAt: null,
    seo: {
      title: "پروتون ویرا لیفت‌بک ۱۳۸۲ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: پروتون ویرا لیفت‌بک مدل ۱۳۸۲ مشکی، کارکرد ۱۰۰ هزار، کابین کاملاً فابریک."
    }
  },
  {
    id: "mazda-323-20260803-1145",
    status: "sold",
    featured: false,
    make: { fa: "مزدا", en: "Mazda" },
    model: { fa: "۳۲۳", en: "323" },
    trim: "GLX",
    year: 1382, calendar: "jalali",
    color: "مشکی", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: 290000,
    price: 745000000,
    insuranceMonths: 6, inspectionMonths: 3, tiresPercent: 60,
    condition: {
      body: "دور رنگ‌شده، سقف و ستون بدون رنگ",
      chassis: "شاسی‌ها و پالونی‌ها بدون ضربه",
      cabin: "بدون پارگی و بدون صدا",
      electrics: "کولر، آمپرها و تمامی ادوات برقی فعال",
      engine: "موتور و گیربکس کاملاً سالم",
      suspension: "زیربندی بدون صدا"
    },
    features: [],
    description: "مزدا ۳۲۳ GLX مدل ۱۳۸۲ با سقف و ستون بدون رنگ؛ در کمتر از یک ساعت فروخته شد.",
    images: [
      "assets/images/vehicles/mazda/323/20260803-1145/00.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/01.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/02.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/03.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/04.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/05.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/06.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/07.jpg",
      "assets/images/vehicles/mazda/323/20260803-1145/08.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/DbkibZiDh78/",
    postedAt: "2026-08-03T11:45+03:30",
    soldAt: null,
    seo: {
      title: "مزدا ۳۲۳ GLX ۱۳۸۲ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: مزدا ۳۲۳ GLX مدل ۱۳۸۲ مشکی، سقف و ستون بدون رنگ، کارکرد ۲۹۰ هزار."
    }
  },
  {
    id: "opel-corsa-20260715-1543",
    status: "sold",
    featured: false,
    make: { fa: "اوپل", en: "Opel" },
    model: { fa: "کورسا", en: "Corsa" },
    trim: "تیپ ۳",
    year: 1994, calendar: "gregorian",
    color: "سفید", transmission: "", fuel: "بنزینی", body: "هاچ‌بک",
    mileageKm: 190000,
    price: 460000000,
    insuranceMonths: 7, inspectionMonths: 12, tiresPercent: 100,
    condition: {
      body: "۴ لکه رنگ، بدون خط و خش",
      chassis: "شاسی‌ها بدون ضربه",
      cabin: "فابریک، بدون پارگی و بدون صدا",
      electrics: "کیلومتر و دورموتور، سیم‌کشی‌ها، ادوات برقی و آمپرها کاملاً سالم",
      engine: "موتور و گیربکس کاملاً سالم، بدون روغن‌ریزی و روغن‌سوزی",
      suspension: ""
    },
    features: ["دورموتور"],
    description: "اوپل کورسا تیپ ۳ مدل ۱۹۹۴ با کابین فابریک و موتور بدون روغن‌ریزی و روغن‌سوزی.",
    images: [
      "assets/images/vehicles/opel/corsa/20260715-1543/00.jpg",
      "assets/images/vehicles/opel/corsa/20260715-1543/01.jpg",
      "assets/images/vehicles/opel/corsa/20260715-1543/02.jpg",
      "assets/images/vehicles/opel/corsa/20260715-1543/03.jpg",
      "assets/images/vehicles/opel/corsa/20260715-1543/04.jpg",
      "assets/images/vehicles/opel/corsa/20260715-1543/05.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/Da0CjYNjjeU/",
    postedAt: "2026-07-15T15:43+03:30",
    soldAt: null,
    seo: {
      title: "اوپل کورسا ۱۹۹۴ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: اوپل کورسا تیپ ۳ مدل ۱۹۹۴ سفید، کارکرد ۱۹۰ هزار، کابین فابریک."
    }
  },
  {
    id: "hyundai-accent-20260715-1327",
    status: "sold",
    coverIndex: 1,
    featured: false,
    make: { fa: "هیوندای", en: "Hyundai" },
    model: { fa: "اکسنت", en: "Accent" },
    trim: "",
    year: 1995, calendar: "gregorian",
    color: "سفید", transmission: "", fuel: "بنزینی", body: "سدان",
    mileageKm: null,
    price: 620000000,
    insuranceMonths: 6, inspectionMonths: null, tiresPercent: 70,
    condition: {
      body: "سقف، صندوق و کاپوت بدون رنگ، بدنه بدون موج و خط و خش",
      chassis: "شاسی‌ها و سینی بدون ضربه",
      cabin: "سالم، بدون صدا",
      electrics: "کولر، بخاری و تمامی ادوات برقی سالم",
      engine: "",
      suspension: ""
    },
    features: [],
    description: "هیوندای اکسنت مدل ۱۹۹۵ با سقف، صندوق و کاپوت بدون رنگ.",
    images: [
      "assets/images/vehicles/hyundai/accent/20260715-1327/00.jpg",
      "assets/images/vehicles/hyundai/accent/20260715-1327/01.jpg",
      "assets/images/vehicles/hyundai/accent/20260715-1327/02.jpg",
      "assets/images/vehicles/hyundai/accent/20260715-1327/03.jpg",
      "assets/images/vehicles/hyundai/accent/20260715-1327/04.jpg",
      "assets/images/vehicles/hyundai/accent/20260715-1327/05.jpg"
    ],
    source: "https://www.instagram.com/classiccarssale/p/Dazy7fpDqeK/",
    postedAt: "2026-07-15T13:27+03:30",
    soldAt: null,
    seo: {
      title: "هیوندای اکسنت ۱۹۹۵ — فروخته شد | طالبی اتوموتیو",
      description: "آرشیو فروش: هیوندای اکسنت مدل ۱۹۹۵ سفید، سقف و صندوق و کاپوت بدون رنگ."
    }
  }
];
