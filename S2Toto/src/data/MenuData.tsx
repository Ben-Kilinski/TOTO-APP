import berinjela from "../../public/berinjela.webp";
import nhoki from "../../public/nhoki.webp";
import salat from "../../public/salat.webp";
import beterraba from "../../public/beterraba.webp";
import ice from "../../public/ice_bold.webp";
import fish_salat_yogurt from "../../public/fish_salat_yougurt.jpg";
import avaz_terin from "../../public/avaz_tarin.webp";
import mortadela from "../../public/mortadela.jpg";
import tuna from "../../public/tuna_spanish.png";
import tartar_bakar from "../../public/tartar_bakar2.jpg";
import gravlax from "../../public/gravalax.jpg";
import peixe_frito from "../../public/fish_metugan.jpeg";
import bar_iam from "../../public/bar_iam.png";
import lokus from "../../public/lokus.jpg";
import shipud_fish from "../../public/shipud_fish.jpg";
import file_bakar from "../../public/file_bakar.jpeg";
import hamburguer from "../../public/HAMBURGUER.jpeg";
import calamari from "../../public/CALAMARI.png";
import tortaneli from "../../public/tortaneli.webp";
import papardela from "../../public/papardela.jpg";
import ravioli from "../../public/ravioli.jpg";
import pizza_classic from "../../public/pizza_classic.jpg";
import pizza_bianca from "../../public/pizza_bianca.jpg";
import pizza_salami from "../../public/pizza_salami.jpg";
import pizza_yam from "../../public/pizza_yam.jpg";
import prime_riv from "../../public/prime_riv.jpg";
import new_york_steak from "../../public/new_york.jpeg";
import porterHouse_Tbone from "../../public/met.webp";

// ----------------- Tipos -----------------
export type Lang = "he" | "pt" | "en";

export interface LocalizedBlock { title: string; text: string; }
export type BlocksByLang = Record<Lang, LocalizedBlock[]>;

export interface Dish {
  he: string; pt: string; en: string;
  image: string;
  description: BlocksByLang;
}

type OldDish = Omit<Dish, "description"> & { description: Record<Lang, string> };

// ----------------- Catálogo de seções (1 fonte da verdade) -----------------
type SectionKey = "about" | "ingredients" | "changes" | "allergens";
const SECTIONS: {
  key: SectionKey;
  titles: Record<Lang, string>;
  aliases: Record<Lang, string[]>; // rótulos aceitos no texto antigo
}[] = [
  {
    key: "about",
    titles: { he: "על המנה", pt: "Sobre o prato", en: "About" },
    aliases: { he: ["על המנה"], pt: ["Sobre o prato", "Sobre"], en: ["About the dish", "About"] },
  },
  {
    key: "ingredients",
    titles: { he: "חומר גלם", pt: "Ingredientes", en: "Ingredients" },
    aliases: { he: ["חומרי גלם", "חומר גלם"], pt: ["Ingredientes"], en: ["Ingredients"] },
  },
  {
    key: "changes",
    titles: { he: "שינויים", pt: "Variações", en: "Modifications" },
    aliases: { he: ["שינויים", "שינויים במנה"], pt: ["Variações", "Alterações"], en: ["Modifications", "Changes"] },
  },
  {
    key: "allergens",
    titles: { he: "רגישויות", pt: "Alergias", en: "Allergens" },
    aliases: { he: ["רגישויות"], pt: ["Alergias", "Alergênicos"], en: ["Allergens"] },
  },
];

// Pré-compila regex por idioma a partir dos aliases
const PARSERS: Record<Lang, { key: SectionKey; rx: RegExp }[]> = {
  he: SECTIONS.map(s => ({ key: s.key, rx: new RegExp(`^(${s.aliases.he.join("|")})\\s*:?\\s*`) })),
  pt: SECTIONS.map(s => ({ key: s.key, rx: new RegExp(`^(${s.aliases.pt.join("|")})\\s*:?\\s*`) })),
  en: SECTIONS.map(s => ({ key: s.key, rx: new RegExp(`^(${s.aliases.en.join("|")})\\s*:?\\s*`) })),
};

function splitIntoBlocks(text: string, lang: Lang): LocalizedBlock[] {
  if (!text?.trim()) return [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");

  const buckets = new Map<SectionKey, string[]>();
  let current: SectionKey | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // detecta cabeçalho
    const found = PARSERS[lang].find(({ rx }) => rx.test(line));
    if (found) {
      current = found.key;
      const cleaned = line.replace(found.rx, "").trim();
      if (!buckets.has(current)) buckets.set(current, []);
      if (cleaned) buckets.get(current)!.push(cleaned);
      continue;
    }

    if (!current) current = "about"; // default
    if (!buckets.has(current)) buckets.set(current, []);
    buckets.get(current)!.push(line);
  }

  // monta na ordem definida em SECTIONS
  const blocks: LocalizedBlock[] = [];
  for (const s of SECTIONS) {
    const arr = buckets.get(s.key);
    if (arr?.length) blocks.push({ title: s.titles[lang], text: arr.join("\n") });
  }
  return blocks.length ? blocks : [{ title: SECTIONS[0].titles[lang], text }];
}

const convertDish = (old: OldDish): Dish => ({
  he: old.he,
  pt: old.pt,
  en: old.en,
  image: old.image,
  description: {
    he: splitIntoBlocks(old.description.he, "he"),
    pt: splitIntoBlocks(old.description.pt, "pt"),
    en: splitIntoBlocks(old.description.en, "en"),
  },
});

// ----------------- DADOS (formato antigo, sem mudar nada) -----------------
const foodMenuRaw: OldDish[] = [
      // porterhouse & T-bone
      {
            he: "פורטרהאוס וטיבון",
            pt: "Porterhouse e T-bone",
            en: "Porterhouse & T-bone",
            description: {
                  he: `נתחים מאוד דומים, מורכבים מעצם בצורת האות T כאשר בצד אחד פילה בקר ובצד השני סינטה. בפורטרהאוס יש יותר פילה מין T, אך ב-2 הנתחים יש לפחות פי 2 יותר סינטה מפילה.`,
                  pt: `Cortes muito semelhantes, compostos por um osso em forma de T, com filé mignon de um lado e contrafilé do outro. O Porterhouse tem mais filé mignon do que o T-bone, mas ambos contêm pelo menos o dobro de contrafilé em relação ao filé.`,
                  en: `Very similar cuts, consisting of a T-shaped bone with tenderloin on one side and striploin on the other. The Porterhouse has more tenderloin than the T-bone, but both have at least twice as much striploin as tenderloin.`,
            },
            image: porterHouse_Tbone,
      },

      // new york steak
      {
            he: "ניו יורק סטייק",
            pt: "New York Steak",
            en: "New York Strip",
            description: {
                  he: `סינטה על העצם, נתח מאזור הגב האחורי, לא שומני, לעיתים קשה יותר מהאנטריקוט. בגלל שאינו שומני לא מוגש מעל מידת עשייה M.`,
                  pt: `Contra-filé com osso (região do lombo traseiro), corte magro, por vezes mais duro que o entrecôte. Por ser magro, não é servido acima do ponto M (ao ponto).`,
                  en: `Bone-in sirloin from the rear back area, lean and sometimes tougher than entrecôte. Because it’s lean, it’s not served above medium (M) doneness.`,
            },
            image: new_york_steak,
      },

      // prime rib
      {
            he: "פריים ריב",
            pt: "Prime Rib",
            en: "Prime Rib",
            description: {
                  he: `סטייק מאזור הצלעות, השומן משורג בתוך הסטייק וכך שהשומן "יספיק" להצלות ולהינמס לא מוגש מתחת למידת עשייה M, כך הסטייק יהיה טעים יותר. אם הלקוח מבקש פחות מ-M יש להמליץ על נתח אחר.`,
                  pt: `Um corte de steak da região das costelas, com gordura entrelaçada na carne. A gordura "derrete" durante o preparo e intensifica o sabor. Não é servido com ponto menor do que "ao ponto" (M), pois isso compromete o sabor. Caso o cliente peça um ponto menor que M, recomenda-se outro corte.`,
                  en: `A steak cut from the rib area, with fat marbled throughout. The fat "renders" during cooking, enhancing flavor. Not served below medium (M) doneness, as lower doneness diminishes flavor. If a guest requests less than M, a different cut is recommended.`,
            },
            image: prime_riv,
      },

      // pizza yam
      {
            he: "פיצה ים",
            pt: "Pizza do Mar",
            en: "Sea Pizza",
            description: {
                  he: `חומרי גלם: רוטב עגבניות (פאסטה), גבינת פטה, טונה מעושנת, תפוח אדמה, סרדינים, פלפל ירוק חריף, ביצה רכה, כוסברה.
על המנה: פיצה קלאסית עם טעמים חזקים, חתיכות של תפוח אדמה (אפוּי לפני על מלח גס).
שינויים במנה: אין שינויים.
רגישויות: גלוטן, לקטוז.`,
                  pt: `Ingredientes: molho de tomate (passata), queijo feta, atum defumado, batata, sardinhas, pimenta verde picante, ovo mole, coentro.
Sobre o prato: pizza clássica com sabores fortes, pedaços de batata assada (pré-assada sobre sal grosso).
Variações: sem possibilidade de alterações.
Alergias: contém glúten, lactose.`,
                  en: `Ingredients: tomato sauce (passata), feta cheese, smoked tuna, potato, sardines, hot green pepper, soft-boiled egg, coriander.
About the dish: classic pizza with strong flavors, featuring chunks of baked potato (pre-baked on coarse salt).
Modifications: no changes available.
Allergens: contains gluten, lactose.`,
            },
            image: pizza_yam,
      },

      // pizza salami
      {
            he: "פיצה סלמי",
            pt: "Pizza de Salame",
            en: "Salami Pizza",
            description: {
                  he: `חומרי גלם: רוטב עגבניות (פאסטה), סלמי (נקניק מבשר לבן), מוצרלה, פרמזן, צ'ילי חריף, זיתי טאסוס שחורים, בצל סגול, רוקט, פרמז'ן.
על המנה: רוטב עגבניות (פאסטה), מוצרלה ופרמזן, טבעות צ'ילי חריף, זיתי טאסוס שחורים, בצל סגול, עלי רוקט מעל וקולפניות פרמז'ן.
שינויים במנה: בלי צ'ילי- מרוטב לא ניתן להוציא את החריף מהרטוב, בלי זיתים, בלי בצל, בלי רוקט, בלי פרמז'ן.
רגישויות: גלוטן, לקטוז, חריף, לא מתאים לילדים.`,
                  pt: `Ingredientes: molho de tomate (passata), salame (embutido de carne suína), muçarela, parmesão, pimenta chili picante, azeitonas pretas (tipo Thassos), cebola roxa, rúcula, parmesão.
Sobre o prato: molho de tomate, muçarela e parmesão, rodelas de pimenta chili, azeitonas pretas, cebola roxa, rúcula e lascas de parmesão por cima.
Variações: sem chili (mas não é possível retirar a pimenta do molho), sem azeitonas, sem cebola, sem rúcula, sem parmesão.
Alergias: contém glúten, lactose, é picante, não recomendado para crianças.`,
                  en: `Ingredients: tomato sauce (passata), salami (pork sausage), mozzarella, parmesan, hot chili pepper, black Thassos olives, red onion, arugula, parmesan.
About the dish: tomato sauce, mozzarella and parmesan, chili rings, black olives, red onion, topped with arugula and shaved parmesan.
Modifications: no chili (note: heat cannot be removed from the sauce), no olives, no onion, no arugula, no parmesan.
Allergens: contains gluten, lactose, spicy, not suitable for children.`,
            },
            image: pizza_salami,
      },

      // pizza bianca
      {
            he: "פיצה ביאנקה",
            pt: "Pizza Bianca",
            en: "Pizza Bianca",
            description: {
                  he: `חומרי גלם: רוטב מורכב: שמנת, פטריות (פורטובלו/ירדן/שמפיניון/פורצ'יני), מרווה, רוזמרין, שום קונפי, שמנת מתוקה, מחית כמהין, גאודה, פרמז'ן.
על המנה: רוטב לבן המכיל רוטב שמנת ופטריות, שמן כמהין, גאודה, פרמז'ן ובייקון.
שינויים במנה: בלי פרמז'ן, ללא בייקון.
רגישויות: גלוטן, לקטוז.`,
                  pt: `Ingredientes: molho branco: creme de leite, cogumelos (portobello/jordan/shiitake/porcini), sálvia, alecrim, alho confitado, creme de leite fresco, pasta de trufas, gouda, parmesão.
Sobre o prato: molho branco com cogumelos e trufas, queijo gouda, parmesão e bacon.
Variações: sem parmesão, sem bacon.
Alergias: contém glúten e lactose.`,
                  en: `Ingredients: white sauce: cream, mushrooms (portobello/jordan/champignon/porcini), sage, rosemary, confit garlic, sweet cream, truffle paste, gouda, parmesan.
About the dish: white sauce with mushrooms and truffle oil, gouda, parmesan and bacon.
Modifications: without parmesan, without bacon.
Allergens: contains gluten and lactose.`,
            },
            image: pizza_bianca,
      },

      // pizza classic
      {
            he: "פיצה קלאסית",
            pt: "Pizza Clássica",
            en: "Classic Pizza",
            description: {
                  he: `חומרי גלם: רוטב עגבניות (פאסאטה), צ'ילי חריף, רוקט, פרמזן.
על המנה: צ'ילי חריף, עלי רוקט מעל וקולפניות פרמזן.
שינויים במנה: בלי צ'ילי – מרוטב לא ניתן להוציא את הצ'ילי, בלי רוקט, בלי פרמזן.
רגישויות: גלוטן, לקטוז, חריף, לא מתאים לילדים.`,
                  pt: `Ingredientes: molho de tomate (passata), pimenta chili picante, rúcula, parmesão.
Sobre o prato: coberta com pimenta chili, rúcula e lascas de parmesão.
Variações: não é possível retirar o chili do molho; possível remover rúcula e parmesão.
Alergias: contém glúten, lactose, picante; não recomendado para crianças.`,
                  en: `Ingredients: tomato sauce (passata), hot chili, arugula, parmesan.
About the dish: topped with chili, arugula and shaved parmesan.
Modifications: chili cannot be removed from the sauce; arugula and parmesan can be removed.
Allergens: contains gluten, lactose, spicy; not suitable for children.`,
            },
            image: pizza_classic,
      },

      // Ravioli
      {
            he: "רביולי גבינות רכות, קטיפת עגבניות ופרמג’יאנו רג’יאנו",
            pt: "Ravioli de Queijos Macios com Creme de Tomate e Parmigiano Reggiano",
            en: "Soft Cheese Ravioli with Tomato Velvet and Parmigiano Reggiano",
            description: {
                  he: `חומרי גלם: רביולי עשוי מבצק רך ורבוך (נימוח, רך ונעים) במילוי גבינות רכות (מסקרפונה, ריקוטה, מוצרלה, גאודה ופרמזן) קטיפת עגבניות (עגבניות שרי, חמאה), מעל פרמזן מגורד, צ'ילי יבש ובזיליקום.
על המנה: מנה נקייה מאוד בטעמים, לא יכולה לצאת רותחת.
שינויים במנה: אין שינויים במנה.
רגישויות: גלוטן, לקטוז, ביצים.`,
                  pt: `Ingredientes: ravioli feito com massa leve e macia, recheado com queijos suaves (mascarpone, ricota, muçarela, gouda e parmesão), creme de tomate (tomate-cereja e manteiga), finalizado com parmesão ralado, pimenta chili seca e manjericão.
Sobre o prato: prato de sabores limpos e delicados, não pode ser servido muito quente.
Variações: sem possibilidade de alterações.
Alergias: contém glúten, lactose, ovos.`,
                  en: `Ingredients: ravioli made with soft, tender dough, filled with soft cheeses (mascarpone, ricotta, mozzarella, gouda, parmesan), cherry tomato velvet (with butter), topped with grated parmesan, dried chili and basil.
About the dish: very clean and delicate in flavor, cannot be served piping hot.
Modifications: no changes allowed.
Allergens: contains gluten, lactose, eggs.`,
            },
            image: ravioli,
      },

      // Pappardelle
      {
            he: "פפרדלה ראגו",
            pt: "Pappardelle com Ragu",
            en: "Pappardelle Ragu",
            description: {
                  he: `חומרי גלם: פסטת חלמונים, עגל חלב, ערמונים, ירקות שורש {גזרים, כרישה, בצל, סלרי, ארטישוק ירושלמי, פטריות יער}, פטרוזיליה, ריחן, שמנת, ציר עגל, פרמזן, בייקון.
על המנה: פסטה רחבה ושטוחה, תבשיל ראגו בשר עגל חלב, מעט שמנת. רוטב קטיפתי ומחבק. מעל פרמז׳ן. יתכן ויהיו קוביות בייקון בראגו.
שינויים במנה: אין שינויים במנה.
רגישויות: גלוטן, לקטוז, ביצים.`,
                  pt: `Ingredientes: massa fresca com gema de ovo, vitela, castanhas, legumes de raiz {cenoura, alho-poró, cebola, salsão, alcachofra de Jerusalém, cogumelos selvagens}, salsa, manjericão, creme de leite, caldo de vitela, parmesão, bacon.
Sobre o prato: massa larga e plana, com ragu de vitela cozido lentamente, um pouco de creme de leite. Molho aveludado e reconfortante. Finalizado com parmesão. O ragu pode conter cubos de bacon.
Variações: não permite modificações.
Alergias: contém glúten, lactose, ovos.`,
                  en: `Ingredients: egg yolk pasta, veal, chestnuts, root vegetables {carrots, leek, onion, celery, Jerusalem artichoke, wild mushrooms}, parsley, basil, cream, veal stock, parmesan, bacon.
About the dish: wide flat pasta served with slow-cooked veal ragu, a touch of cream. Velvety, comforting sauce. Topped with parmesan. Ragu may contain bacon cubes.
Modifications: no changes allowed.
Allergens: contains gluten, lactose, eggs.`,
            },
            image: papardela,
      },

      // Tortellini
      {
            he: "טורטליני זנב",
            pt: "Tortellini de Rabo",
            en: "Oxtail Tortellini",
            description: {
                  he: `חומרי גלם: טורטליני, זנב, יין אדום, סלרי לבן, ירקות {סלקים/לפת/אפונת גינה/בצלים קטנים/גזרים/שום קונפי}.
על המנה: טורטליני עשוי מבצק רך ונימוח את הבשר בעיטוף בקיפול ייחודי. הטורטליני ממולא בזנב בבישול ארוך של יין אדום, מזוג בציר של עצמו. פירה שורש סלרי לבן.
שינויים במנה: אין שינויים.
רגישויות: גלוטן, לקטוז, ביצים.`,
                  pt: `Ingredientes: tortellini, rabo (de boi), vinho tinto, aipo branco, legumes {beterraba/nabo/ervilha/tomatinhos/mini cebolas/cenoura/alho confitado}.
Sobre o prato: tortellini de massa macia e delicada com fechamento único. Recheado com rabo cozido lentamente no vinho tinto, servido com seu próprio caldo. Purê de raiz de aipo branco.
Variações: não permite modificações.
Alergias: contém glúten, lactose e ovos.`,
                  en: `Ingredients: tortellini, oxtail, red wine, white celery, vegetables {beets/turnip/garden peas/baby onions/carrots/confit garlic}.
About the dish: soft and delicate tortellini dough with unique fold, filled with slow-cooked oxtail in red wine. Served with its own broth and white celery root purée.
Modifications: no changes allowed.
Allergens: contains gluten, lactose, eggs.`,
            },
            image: tortaneli,
      },

      // Calamari
      {
            he: "קלמרי מטוגן",
            pt: "Lula Frita",
            en: "Fried Calamari",
            description: {
                  he: `חומרי גלם: ראשים וגופים של קלמארי מהים התיכון בציפוי פריך, איולי, רוטב חלפיניו בזיליקום.
על המנה: הקלמארי מוגש לצד עלים משתנים {בזיליקום/ריחן פרסי/נענע}, מיונז מיסו, רוטב חלפיניו כוסברה - על בסיס סויה.
שינויים במנה: אין שינויים.
רגישויות: גלוטן.`,
                  pt: `Ingredientes: cabeças e corpos de lula do Mediterrâneo com crosta crocante, aioli, molho de jalapeño com manjericão.
Sobre o prato: servido com folhas variáveis {manjericão/manjericão persa/hortelã}, maionese de missô, e molho de jalapeño com coentro à base de soja.
Variações: não permite modificações.
Alergias: contém glúten.`,
                  en: `Ingredients: Mediterranean calamari heads and bodies in crispy coating, aioli, jalapeño basil sauce.
About the dish: served with seasonal greens {basil/Persian basil/mint}, miso mayo, and cilantro-jalapeño sauce on a soy base.
Modifications: no changes allowed.
Allergens: contains gluten.`,
            },
            image: calamari,
      },

      // Hamburger
      {
            he: "המבורגר",
            pt: "Hambúrguer",
            en: "Hamburger",
            description: {
                  he: `חומרי גלם: המבורגר קצוץ מאנטריקוט (ללא לחמניה), על רוטב שמנת פלפלת ופירה.
על המנה: לא ניתן לקבל את ההמבורגר MR, יש בתוכו שומן שצריך להיצלות.
שינויים במנה: רוטב בצד, ירקות ירוקים במקום פירה.
רגישויות: לקטוז.`,
                  pt: `Ingredientes: hambúrguer moído de entrecôte (sem pão), servido sobre molho cremoso de pimenta e purê.
Sobre o prato: não é possível pedir o hambúrguer ao ponto para mal (MR), pois a gordura interna precisa estar completamente cozida.
Variações: molho à parte, legumes verdes no lugar do purê.
Alergias: contém lactose.`,
                  en: `Ingredients: chopped entrecôte hamburger (no bun), served on pepper cream sauce and purée.
About the dish: burger cannot be ordered medium-rare (MR), as the inner fat must be fully cooked.
Modifications: sauce on the side, green vegetables instead of purée.
Allergens: contains lactose.`,
            },
            image: hamburguer,
      },

      // fillet bakar
      {
            he: "פילה בקר",
            pt: "Filé de boi",
            en: "Beef fillet",
            description: {
                  he: `חומרי גלם: פילה בקר (220 גרם), חמאה, שומן אווז, ציר בקר ובצלים, תוספת פירה.
על המנה: פילה בקר צלוי עם רוטב של ציר בקר ובצלים עם חמאה ופירה. יש לבחור מידת עשייה. פילה בקר הוא נתח שמן ולכן שינויים לבחירת החל מ – R ועד WD. במידות עשייה גבוהות המנה תצא כמדליוינים.
שינויים במנה: רוטב בצד, ללא לקטוז. רגישויות: לקטוז.`,
                  pt: `Ingredientes: filé de boi (220g), manteiga, gordura de ganso, caldo de carne com cebolas, purê.
Sobre o prato: filé grelhado servido com molho de caldo de carne e cebolas com manteiga, acompanhado de purê. É necessário escolher o ponto da carne. Por ser um corte gorduroso, é possível escolher entre mal passado (R) até bem passado (WD). Em pontos altos de cozimento, a carne é servida fatiada como medalhões.
Variações: molho à parte, sem lactose. Alergias: contém lactose.`,
                  en: `Ingredients: beef fillet (220g), butter, goose fat, beef stock with onions, purée.
About the dish: seared beef fillet served with beef-onion butter sauce and purée. Doneness level must be chosen. This is a fatty cut, so recommended doneness ranges from rare (R) to well-done (WD). At higher doneness, the meat is served sliced as medallions.
Modifications: sauce on the side, lactose-free. Allergens: contains lactose.`,
            },
            image: file_bakar,
      },

      // Shipud fish
      {
            he: "שיפוד דג",
            pt: "Espetinho de peixe grelhado",
            en: "Grilled fish skewer",
            description: {
                  he: `חומרי גלם: שיפוד דג בגריל (טונה/אינטיאס/פלמידה)
על המנה: שיפוד דג בגריל, צרוב מבחוץ ומעט נא מבפנים. יוצא על רוטב ספייסי הדרים חמים, פירה, עלים ירוקים יוגורט ואגוזים.
שינויים במנה: ספייסי הדרים בצד, בלי אגוזים, יוגורט בצד
רגישויות: לקטוז.`,
                  pt: `Ingredientes: espetinho de peixe grelhado (atum / seriola / bonito).
Sobre o prato: espetinho de peixe grelhado, selado por fora e levemente cru por dentro. Servido com molho cítrico picante quente, purê, folhas verdes, iogurte e nozes.
Variações: pode-se servir o molho picante cítrico à parte, sem nozes, iogurte à parte.
Alergias: contém lactose.`,
                  en: `Ingredients: grilled fish skewer (tuna / amberjack / bonito).
About the dish: fish skewer grilled, seared on the outside and slightly raw inside. Served with hot citrus-spicy sauce, purée, green leaves, yogurt and nuts.
Modifications: spicy citrus sauce on the side, no nuts, yogurt on the side.
Allergens: contains lactose.`,
            },
            image: shipud_fish,
      },

      // Lokus kbab
      {
            he: "קבב לוקוס",
            pt: "Kebab de garoupa",
            en: "Grouper kebab",
            description: {
                  he: `חומרי גלם: קבב מלוקוס טרי, הרבה עשבים (פטרוזיליה, כוסברה), זרעי כוסברה, בצל.
על המנה: קבב לוקוס קצוץ על הסכין. מתובל שמנת חזרת (חזרת טרייה), קטיפת קרם אבוקדו וצ'יפוטלה (מיץ לימון, דבש).
שינויים במנה: אין שינויים.
רגישויות: לקטוז.`,
                  pt: `Ingredientes: kebab de garoupa fresca, muitas ervas (salsa, coentro), sementes de coentro, cebola.
Sobre o prato: kebab de garoupa picado na faca, temperado com creme de raiz-forte (raiz-forte fresca), toque de creme de abacate e chipotle (com suco de limão e mel).
Variações: sem alterações disponíveis.
Alergias: contém lactose.`,
                  en: `Ingredients: fresh grouper kebab, lots of herbs (parsley, coriander), coriander seeds, onion.
About the dish: knife-chopped grouper kebab, seasoned with fresh horseradish cream, topped with avocado-chipotle cream (with lemon juice and honey).
Modifications: no changes available.
Allergens: contains lactose.`,
            },
            image: lokus,
      },

      // Bar yam
      {
            he: "בר ים",
            pt: "Robalo do mar",
            en: "Sea bass",
            description: {
                  he: `חומרי גלם: פילה בר ים, ברוטב של ורמוט, חמאה, חרדל, פטריות מלך היער, אפונה/אספרגוס (תלוי עונה), ארטישוק ירושלמי בריגול (בריגול -בישול איטי בשמן זית, יין לבן), ערמונים, מחית כמחית.
על המנה: בר ים שהוא דג לברק. הבר מקבל צריבה לעור ולאחר מכן מבושל ברוטב של חמאה לבנה, חרדל ופטריות מלך היער.
שינויים במנה: אפשר להחליף תוספת לירקות ירוקים במקום פירה.
רגישויות: לקטוז.`,
                  pt: `Ingredientes: filé de robalo (bar yam), servido em molho de vermute, manteiga, mostarda, cogumelos eryngii (Rei da Floresta), ervilhas ou aspargos (de acordo com a estação), alcachofra de Jerusalém confitada (cozida lentamente em azeite e vinho branco), castanhas portuguesas, purê de batata.
Sobre o prato: robalo grelhado na pele e finalizado em molho de manteiga branca, mostarda e cogumelos eryngii.
Variações: é possível trocar o purê por legumes verdes.
Alergias: contém lactose.`,
                  en: `Ingredients: sea bass fillet, in a sauce of vermouth, butter, mustard, king oyster mushrooms, peas or asparagus (seasonal), confit Jerusalem artichokes (slow-cooked in olive oil and white wine), chestnuts, mashed potatoes.
About the dish: sea bass seared on the skin and then simmered in a white butter and mustard sauce with king oyster mushrooms.
Modifications: green vegetables can replace the mashed potatoes.
Allergens: contains lactose.`,
            },
            image: bar_iam,
      },

      // Fried sea
      {
            he: "דגי ים מטוגנים",
            pt: "Peixes do mar fritos",
            en: "Fried sea fish",
            description: {
                  he: `חומרי גלם: 350 גרם דגי ים משתנים {ברבוניות/פרש בקלח/מלטיות} לצד עלים משתנים {בזיליקום/ריחן פרסי/נענע}, מתבלים ממזרח למערב.
על המנה: דגים מטוגנים בשלמותם, תמיד עם עצמות. מטוגנים בציפוי קמח ותבלינים. בצד מתבלים: חלפיניו כוסברה, רוטב סלקים, רוטב עגבניות *צריך לערוך את השולחן עם צלחת לעצמות*
שינויים במנה: אין שינויים.
רגישויות: גלוטן.`,
                  pt: `Ingredientes: 350g de peixes do mar variados (como salmão-do-mar, pargo ou peixe-rei). Acompanhados de folhas frescas sazonais (manjericão, hortelã persa, hortelã). Temperos do Oriente ao Ocidente.
Sobre o prato: peixes fritos inteiros, sempre com espinhas. Empanados com farinha e especiarias. Acompanhamentos: molho de coentro com jalapeño, molho de beterraba, molho de tomate. *Importante: preparar um pratinho separado para as espinhas.*
Variações: sem alterações.
Alergias: contém glúten.`,
                  en: `Ingredients: 350g of assorted sea fish (such as red mullet, parrotfish, or lizardfish). Served with seasonal greens (basil, Persian basil, mint). Spices ranging from East to West.
About the dish: whole fried fish, always served with bones. Fried in a flour and spice coating. Served with jalapeño-coriander sauce, beet sauce, and tomato sauce. *Note: be sure to provide a small plate for the bones.*
Modifications: no changes.
Allergens: contains gluten.`,
            },
            image: peixe_frito,
      },

      // Salmon Gravlax
      {
            he: "גרבלקס סלמון עם רוטב טרטר, בצלמים לבנים וביצה רכה",
            pt: "Gravlax de salmão com molho tártaro, cebolas brancas e ovo mole",
            en: "Salmon Gravlax with tartar sauce, white onions, and soft-boiled egg",
            description: {
                  he: `חומרי גלם: פילה סלמון בכבישה ביתית, כבישה במלח, סוכר, זרעי שומר וכוסברה ושמיר. ביצה רכה, רוטב טרטר (על בסיס איולי, צלפים קצוצים, מלפפונים חמוצים קצוצים, חומץ)
על המנה: פרוסות עבות יחסית של גרבלקס, ביצה רכה, שמיר, גרגר נחלים, חזרת, קרם פרש וטוסטים. יוצא עם רוטב טרטר.
שינויים במנה: אין.
רגישויות: לקטוז, גלוטן.`,
                  pt: `Ingredientes: filé de salmão curado em casa (cura com sal, açúcar, sementes de coentro, funcho e endro). Ovo com gema mole. Molho tártaro à base de maionese (aioli), alcaparras picadas, picles picados, vinagre.
Sobre o prato: fatias relativamente grossas de gravlax, ovo mole, endro, agrião, raiz-forte, crème fraîche e torradas. Servido com molho tártaro à parte.
Variações: nenhuma.
Alergias: lactose, glúten.`,
                  en: `Ingredients: homemade cured salmon fillet (cured with salt, sugar, coriander seeds, fennel, and dill). Soft-boiled egg. Tartar sauce based on aioli, chopped capers, chopped pickles, and vinegar.
About the dish: thick slices of gravlax, soft-boiled egg, dill, watercress, horseradish, crème fraîche, and toasts. Served with tartar sauce on the side.
Modifications: none.
Allergens: lactose, gluten.`,
            },
            image: gravlax,
      },

      // Prosciutto or mortadella
      {
            he: "פרשוטו\\מורטדלה",
            pt: "Presunto cru ou mortadela",
            en: "Prosciutto or mortadella",
            description: {
                  he: `חומרי גלם: פרושוטו סן דניאלס/מורטדלה (משתנה בהתאם לזמינות), טוסטים, מוגש עם איולי צלחת ירקות פריכים (מלפפון/עגבנייה/צנונית), שקדים.
על המנה: מומלץ למרכז שולחן.
שינויים במנה: אין שינויים.
רגישויות: גלוטן - טוסטים, שקדים, ביצים חיות באיולי.`,
                  pt: `Ingredientes: presunto cru San Daniele ou mortadela (varia conforme disponibilidade), torradas, servido com aioli e uma salada crocante (pepino/tomate/rabanete), amêndoas.
Sobre o prato: recomendado como entrada para compartilhar no centro da mesa.
Variações: sem variações.
Alergias: contém glúten (torradas) e ovos crus no aioli.`,
                  en: `Ingredients: San Daniele prosciutto or mortadella (depending on availability), toasts, served with aioli and a crunchy salad (cucumber/tomato/radish), almonds.
About the dish: recommended as a shared appetizer for the center of the table.
Modifications: no changes.
Allergens: contains gluten (toasts), almonds, and raw eggs in the aioli.`,
            },
            image: mortadela,
      },

      // Smoked Spanish tuna
      {
            he: "טונה ספרדית מעושנת",
            pt: "Atum espanhol defumado",
            en: "Smoked Spanish tuna",
            description: {
                  he: `חומרי גלם: טונה ספרדית, איולי, טוסטים, צלחת ירקות פריכים {חסה/מלפפון/עגבנייה}.
על המנה: פרוסות דקות של טונה ספרדית מעושנת. מומלץ לא לאכול עם סכין ומזלג. מעולה למרכז שולחן.
שינויים במנה: אין שינויים.
רגישויות: גלוטן - טוסטים, ביצים חיות באיולי.`,
                  pt: `Ingredientes: atum espanhol defumado, aioli, torradas, salada de vegetais crocantes {alface/pepino/tomate}.
Sobre o prato: finas fatias de atum espanhol defumado. Recomenda-se não comer com faca e garfo. Excelente para compartilhar no centro da mesa.
Variações: sem variações.
Alergias: contém glúten (torradas) e ovos crus (no aioli).`,
                  en: `Ingredients: smoked Spanish tuna, aioli, toasts, plate of crispy vegetables {lettuce/cucumber/tomato}.
About the dish: thin slices of smoked Spanish tuna. Recommended to eat without fork and knife. Excellent as a center-of-table appetizer.
Modifications: no changes.
Allergens: contains gluten (toasts) and raw eggs (in the aioli).`,
            },
            image: tuna,
      },

      // Beef Steak Tartare
      {
            he: "טרטר בקר",
            pt: "Steak Tartare de carne bovina",
            en: "Beef Steak Tartare",
            description: {
                  he: `חומרי גלם: בקר {פילה עגל/פילה בקר}, כוסברה, וורצ’יסטר, טבסקו, חרדל, צלפים, בצל ירוק ולבן, כוסברה, פלפל שחור גרוס, מלח, קוניאק, ביצת שליו, טוסטים, קוקט בצד עם איולי וחרדל.
על המנה: זהו לא טרטר קלאסי, זה טרטר מתובלן ועוצמתי. הטרטר קצוץ בסכין. תמיד בשר טרי, שלא עבר יישון. פילה עגלה = בשר צעיר, טעם עדין, צבע בהיר.
שינויים במנה: אין שינויים.
רגישויות: בשר חי, ביצת שליו (לחריוניות), גלוטן - טוסטים.`,
                  pt: `Ingredientes: carne bovina (filé de vitela ou filé bovino), coentro, molho Worcestershire, tabasco, mostarda, alcaparras, cebolinha e cebola branca, coentro, pimenta-do-reino moída, sal, conhaque, ovo de codorna, torradas. Acompanha coqueteleira com aioli e mostarda.
Sobre o prato: não é um steak tartare clássico, mas sim uma versão temperada e intensa. A carne é picada na faca. Sempre usamos carne fresca, nunca maturada. Filé de vitela = carne jovem, sabor suave, cor clara.
Variações: sem variações.
Alergias: carne crua, ovo de codorna (para gestantes), glúten (torradas).`,
                  en: `Ingredients: beef {veal fillet or beef fillet}, coriander, Worcestershire sauce, Tabasco, mustard, capers, green and white onion, coriander, ground black pepper, salt, cognac, quail egg, toasts. Served with a side cocktail of aioli and mustard.
About the dish: this is not a classic tartare — it’s a bold and flavorful version. The meat is finely chopped with a knife. Always made with fresh, non-aged meat. Veal fillet = young meat, delicate flavor, pale color.
Modifications: no changes.
Allergens: raw meat, quail egg (for pregnant women), gluten – toasts.`,
            },
            image: tartar_bakar,
      },

      // Avaz Goose Liver Terrine
      {
            he: "טרין כבד אווז",
            pt: "Terrina de fígado de ganso",
            en: "Goose liver terrine",
            description: {
                  he: `חומרי גלם: פרוסת טרין כבד אווז (140 גרם) מפריגור, סלט קטן (חסות, צנונית וכו׳) בויניגרט פריגור, טוסטים ומרמלדה.
על המנה: מנה מאוד קלאסית. טרין זהו כלי החרס בו נאפה הכבד בשיטה ייחודית, ומוגש כפרוסה. הכבדים מפריגור שבצרפת.
שינויים במנה: אין שינויים.
רגישויות: גלוטן - טוסטים, לקטוז.`,
                  pt: `Ingredientes: fatia de fígado de ganso (140g) da região de Périgord, saladinha (alface, rabanete etc.) com vinagrete de Périgord, torradas e marmelada.
Sobre o prato: prato muito clássico. A terrina é um recipiente de cerâmica onde o fígado é assado de forma especial, depois servido em fatia. Os fígados vêm da região de Périgord, na França.
Variações: sem variações.
Alergias: contém glúten (torradas) e lactose.`,
                  en: `Ingredients: slice of goose liver terrine (140g) from the Périgord region, small salad (lettuce, radish, etc.) with Périgord vinaigrette, toasts and marmalade.
About the dish: a very classic dish. The terrine is a ceramic dish used to bake the liver in a unique way, then served as a slice. The livers are sourced from the Périgord region in France.
Modifications: no changes.
Allergens: contains gluten (toasts) and lactose.`,
            },
            image: avaz_terin,
      },

      // Fish salad with yogurt
      {
            he: "דג נא סלט ירקות חורף קצוצים דק יוגורט יווני",
            pt: "Peixe cru com salada de legumes de inverno picados e iogurte grego",
            en: "Raw fish with finely chopped winter vegetables and Greek yogurt",
            description: {
                  he: `חומרי גלם: סלט עשבים ים תיכוני קצוץ דק (כוסברה, פטרוזיליה, נענע, אורגנו טרי, בצל, צ'ילי, מלפפון, עגבניה ושברי שקדים קלויים), פרוסות דג נא ויוגורט יווני.
שינויים במנה: אפשר בלי צ'ילי וכוסברה, יוגורט בצד.`,
                  pt: `Ingredientes: salada de ervas mediterrâneas finamente picadas (coentro, salsinha, hortelã, orégano fresco, cebola, pimenta, pepino, tomate e lascas de amêndoas torradas), fatias de peixe cru e iogurte grego.
Variações: pode ser servido sem pimenta e coentro, iogurte ao lado.`,
                  en: `Ingredients: finely chopped Mediterranean herb salad (cilantro, parsley, mint, fresh oregano, onion, chili, cucumber, tomato, and toasted almond shards), slices of raw fish and Greek yogurt.
Modifications: can be served without chili and cilantro, yogurt on the side.`,
            },
            image: fish_salat_yogurt,
      },

      // Sashimi of sea fish on ice
      {
            he: "ששימי דגי ים על הקרח",
            pt: "Sashimi de peixes do mar sobre gelo",
            en: "Sashimi of sea fish on ice",
            description: {
                  he: `חומרי גלם: דגי ים טריים (משתנה – כרגע לרוב טונה ואינטיאס), רוטב טזאזו בזיליקום (פונזו של טוטו – סויה, חומץ אורז, מירין, מיץ לימון, ג’ינג’ר), רוטב סויה וספייס (פלפל שחור, שום, ג’ינג’ר, יוזו וליים).
על המנה: ששימי טונה ואינטיאס נאיים וטריים, הדגים יכולים להשתנות, מוגש בקערה על קרח. עלים ארומטיים (נעוע, בזיליקום סגול וירוק, כוסברה).
שינויים במנה: אין שינויים במנה.
רגישויות: גלוטן (סויה).`,
                  pt: `Ingredientes: peixes do mar frescos (variam — atualmente geralmente atum e sériole), molho Tzazu com manjericão (ponzu do Toto — shoyu, vinagre de arroz, mirin, suco de limão, gengibre), molho de soja apimentado (pimenta-do-reino, alho, gengibre, yuzu e limão).
Sobre o prato: sashimi fresco de atum e sériole, pode variar conforme o dia. Servido em tigela sobre gelo. Folhas aromáticas (shiso, manjericão verde e roxo, coentro).
Variações: sem modificações possíveis.
Alergias: contém glúten (shoyu).`,
                  en: `Ingredients: fresh sea fish (varies — currently mainly tuna and amberjack), tzazu basil sauce (Toto-style ponzu — soy sauce, rice vinegar, mirin, lemon juice, ginger), spicy soy sauce (black pepper, garlic, ginger, yuzu and lime).
About the dish: sashimi of fresh tuna and amberjack, fish may vary. Served in a bowl over ice. Aromatic herbs (shiso, green and purple basil, cilantro).
Modifications: no changes possible.
Allergens: gluten (soy).`,
            },
            image: ice,
      },

      // beterraba
      {
            he: "סלקים של חורף",
            pt: "Beterrabas de inverno",
            en: "Winter beets",
            description: {
                  he: `חומרי גלם: סלקים, ויניגרט הדרים (תפוזי דם/קלמנטינות, דבש, חומץ שרי, שמן אגוזים, פלפל טזמני), עלים ירוקים (משתנה), קרם פרש, גבינת עיזים טרייה,
על המנה: סלקים צלויים בשלמותם בתנור על מלח, מקולפים. שורשים טובים בחורף, אין סיבים
ויש מתוקקות נעימה. הגבינה משתנה - כרגע זו גבינת עיזים טרייה.
שינויים במנה: בלי קרם פרש, בלי גבינה. פרט לזה אין שינויים במנה.
רגישויות: לקטוז - קרם פרש, גבינה, אגוזים - שמן אגוזים, דבש.`,
                  pt: `Ingredientes: beterrabas, vinagrete cítrico (laranja sanguínea/tangerina, mel, vinagre de cereja, óleo de noz, pimenta da Tasmânia), folhas verdes (variam), crème fraîche, queijo de cabra fresco.
Sobre o prato: beterrabas assadas inteiras no forno sobre sal grosso, descascadas. Raízes boas no inverno, sem fibras, com doçura agradável. O queijo pode variar — atualmente usamos queijo de cabra fresco.
Variações: sem crème fraîche, sem queijo. Fora isso, não há modificações no prato.
Alergias: lactose – crème fraîche, queijo; nozes – óleo de noz; mel.`,
                  en: `Ingredients: beets, citrus vinaigrette (blood orange/clementine, honey, cherry vinegar, walnut oil, Tasmanian pepper), green leaves (seasonal), crème fraîche, fresh goat cheese.
About the dish: whole roasted beets baked on salt, then peeled. Winter roots are naturally sweet and fiberless. The cheese changes seasonally — currently we use fresh goat cheese.
Modifications: without crème fraîche or cheese. No other modifications possible.
Allergens: lactose – crème fraîche, cheese; nuts – walnut oil; honey.`,
            },
            image: beterraba,
      },

      // Leaf salad
      {
            he: "סלט עלים",
            pt: "Salada de folhas",
            en: "Leaf salad",
            description: {
                  he: `חומרי גלם: מבחר חסות ואנדיב (משתנה בהתאם לעונה) ארוגולה, בצל סגול, צנונית, שקדים קלויים בחמאה, גבינה (יכול להשתנות - כרגע אנחנו עם ברי בקר), ויניגרט פריגור (שמן זית, שמן אגוזים, זרעי כוסברה, חרדל, דבש, חומץ שרי).
על המנה: טיפול עדין ויסודי לעליי החסה, שמירה על טריות ופריכות. משתנה לפי עונה. הגבינה המשתנה תהיה תמיד טרייה, בעלת טעם עדין, מלפט ולא דומיננטי (טעם שמשתלב בצורה טובה וכנה).
שינויים במנה: בלי בצל, בלי שקדים, בלי גבינה. בסיס שמן זית ומיץ לימון.
רגישויות: לקטוז - שקדים וגבינה, דבש - ברוטב.`,
                  pt: `Ingredientes: seleção de alfaces e endívia (varia conforme a estação), rúcula, cebola roxa, rabanete, amêndoas tostadas na manteiga, queijo (atualmente usamos queijo brie de vaca), vinagrete Périgord (azeite de oliva, óleo de noz, sementes de coentro, mostarda, mel e vinagre de cereja).
Sobre o prato: tratamento delicado e cuidadoso das folhas para preservar frescor e crocância. Pode variar com a estação. O queijo usado será sempre fresco, com sabor suave, que complementa o prato sem dominar.
Variações: sem cebola, sem amêndoas, sem queijo. Base alternativa: azeite e suco de limão.
Alergias: lactose (amêndoas, queijo), mel no molho.`,
                  en: `Ingredients: mix of lettuces and endive (seasonal), arugula, red onion, radish, butter-roasted almonds, cheese (currently cow’s milk brie), Périgord vinaigrette (olive oil, walnut oil, coriander seeds, mustard, honey, cherry vinegar).
About the dish: gentle handling of the lettuce leaves to preserve freshness and crispness. Changes with the seasons. The cheese is always fresh, mild, and complements the flavors without overpowering.
Modifications: without onion, without almonds, without cheese. Alternate base: olive oil and lemon juice.
Allergens: lactose (almonds, cheese), honey in the dressing.`,
            },
            image: salat,
      },

      // eggplant
      {
            he: "חציל שרוף על אש גלויה",
            pt: "Berinjela assada na brasa",
            en: "Charcoal-grilled eggplant",
            description: {
                  he: `חומרי גלם: חציל בלאדי שלם, טחינה שחורה (טחינה, שום, דבש, קצח, צ'ילי) טולום טורקית-גבינת כבשים, סלסת עגבניות, יוגורט יווני- גבינת בקר, בצל סגול, פרוסות צ'ילי ירוק, ועלים משתנים. (ראש"ד, פטרוזיליה וכו')
על המנה: חציל שלם שנשרף בשלמותו על גריל פחם באש גלויה יושב על הטחינה. מנה מעט חריפה מעט מתוקה טעמים של טחינה על אש.
שינויים במנה: ניתן לעשות שינויים.
רגישויות: לקטוז, דבש-טחינה.`,
                  pt: `Ingredientes: berinjela inteira (baladi), tahine preta (tahine, alho, mel, nigella, pimenta), queijo turco Tulum (leite de ovelha), salsa de tomate, iogurte grego (leite de vaca), cebola roxa, fatias de pimenta verde e folhas variadas (coentro, salsa, etc).
Sobre o prato: berinjela inteira assada diretamente sobre carvão em fogo vivo, servida sobre tahine. Sabor levemente picante e adocicado com toque defumado.
Variações: modificações são possíveis.
Alergias: lactose, mel, tahine.`,
                  en: `Ingredients: whole baladi eggplant, black tahini (tahini, garlic, honey, nigella, chili), Turkish Tulum cheese (sheep’s milk), tomato salsa, Greek yogurt (cow’s milk), red onion, green chili slices, and assorted herbs (cilantro, parsley, etc).
About the dish: whole eggplant fully roasted over charcoal flame, served on black tahini. Slightly spicy, sweet and smoky flavor.
Modifications: changes can be made.
Allergens: lactose, honey, tahini.`,
            },
            image: berinjela,
      },

      // nhoki
      {
            he: "ניוקי תפוחי אדמה וריקוטה",
            pt: "Nhoque de batata e ricota",
            en: "Potato and ricotta gnocchi",
            description: {
                  he: `חומרי גלם: תפ"א, ריקוטה, חמאה, מרווה, ערמונים, ציר עוף, שמן כמחייך לבנות, פרמז'ן.
על המנה: ניוקי מבצק של תפ"א וריקוטה (קמח וביצים). בתוך זיגוג של חמאה, מרווה, ערמונים פרוסים, גבעות של שמן כמחייך לבנות ופרמז'ן.
שינויים במנה: צמחוני (בלי ציר עוף), בלי פרמז'ן.
רגישויות: גלוטן, לקטוז, ביצים.`,
                  pt: `Ingredientes: batata, ricota, manteiga, sálvia, castanhas, caldo de frango, óleo aromático, parmesão.
Sobre o prato: nhoque feito de massa de batata e ricota (com farinha e ovos). Servido com glacê de manteiga, sálvia, castanhas fatiadas, gotas de óleo aromático e parmesão.
Variações: vegetariano (sem caldo de frango), sem parmesão.
Alergias: glúten, lactose, ovos.`,
                  en: `Ingredients: potato, ricotta, butter, sage, chestnuts, chicken stock, aromatic oil, parmesan.
About the dish: gnocchi made from potato and ricotta dough (with flour and eggs). Served in a glaze of butter, sage, sliced chestnuts, drops of aromatic oil and parmesan.
Modifications: vegetarian (without chicken stock), without parmesan.
Allergens: gluten, lactose, eggs.`,
            },
            image: nhoki,
      },
];

// ----------------- EXPORT -----------------
export const foodMenu: Dish[] = foodMenuRaw.map(convertDish);
