import {
  terms as chineseTerms,
  history as chineseHistory,
  songLines as chineseSongLines,
  references as chineseReferences,
} from './terms.js';

// English names use familiar equivalents of the HKO solar-term glossary.
// IDs, longitude, season keys, references and song mappings remain shared.
// Poem excerpts below are original English translations for this site.
const termContent = [
  {
    name: 'Start of Spring', pinyin: 'Lichun',
    meaning: 'Li means beginning. Spring begins here in the traditional Chinese seasonal calendar; the arrival of spring weather varies by region.',
    climate: 'The Yellow River basin is often still cold. Plants may begin to sprout in parts of Jiangnan, south of the lower Yangtze, while warm and cold spells alternate.',
    farming: 'Farmers in the south gradually prepare for spring planting. In the north, they check soil moisture around overwintering wheat, repair tools and prepare seed.',
    culture: 'Some communities welcome spring by eating spring pancakes or radishes. Spring celebrations and the ceremonial whipping of a model ox express hopes for productive farming and a good harvest.',
  },
  {
    name: 'Rain Water', pinyin: 'Yushui',
    meaning: 'The name recalls a seasonal pattern of melting ice and snow and increasing rain. It does not promise rain on the day itself.',
    climate: 'Rainy days often become more frequent in southern China, while snow remains possible in the north. Local temperatures determine when plants begin to grow.',
    farming: 'Northern wheat fields need to retain moisture. In the south, good drainage helps prepare suitable soil conditions for spring planting.',
    culture: 'In parts of western Sichuan, families traditionally choose honorary godparents for children in a custom called la baobao, expressing hopes for their growth and well-being.',
    poem: {
      line: 'Good rain knows its season; it comes as spring begins.',
      author: 'Du Fu', title: 'Delighting in Rain on a Spring Night',
      note: 'English translation for this site.',
    },
  },
  {
    name: 'Awakening of Insects', pinyin: 'Jingzhe',
    meaning: 'Zhe refers to creatures sheltering through winter. The name connects spring thunder with the return of active life.',
    climate: 'Some overwintering insects become active as temperatures rise. Their activity mainly responds to warmth; thunder does not wake them.',
    farming: 'Spring fieldwork gathers pace in Jiangnan, where wheat and vegetable fields may need drainage. Northern fieldwork depends on thawing soil and available moisture.',
    culture: 'Eating pears is a Jingzhe custom in Shanxi and some other places. Its stories and symbolism belong to folk tradition, not to astronomical or medical laws.',
  },
  {
    name: 'Spring Equinox', pinyin: 'Chunfen',
    meaning: 'The point directly beneath the Sun crosses the equator from south to north. The Sun reaches an ecliptic longitude of 0°.',
    climate: 'Day and night are close to equal in length across much of the world. Spring looks different across China, and northern areas can still face cold spells.',
    farming: 'Spring sowing follows the warmth accumulated locally. Winter wheat reaches an important growth stage between the Yellow and Huai rivers, while Jiangnan farmers watch for waterlogged fields.',
    culture: 'Local customs include eating spring greens, flying kites and balancing eggs. Eggs can be balanced at any time of year; no special equinox gravity is required.',
  },
  {
    name: 'Pure Brightness', pinyin: 'Qingming',
    meaning: 'The name evokes warmer weather and fresh spring growth. Qingming is both a solar term and a traditional festival.',
    climate: 'Spring rain is common in Jiangnan, while northern China often warms quickly. The drizzle celebrated in poetry does not occur everywhere every year.',
    farming: 'Spring crops are sown in many regions, and rice seedlings are raised in the south. Spring tea harvesting follows local elevation, tea variety and weather.',
    culture: 'Visiting ancestral graves and remembering loved ones accompany spring outings. Jiangnan has qingtuan, green glutinous rice cakes; other regions have their own Cold Food Festival pastries.',
    poem: {
      line: 'At Qingming, rain falls thick and fine; travelers on the road are weighed down with sorrow.',
      author: 'Du Mu (traditional attribution)', title: 'Qingming',
      note: 'English translation for this site.',
    },
  },
  {
    name: 'Grain Rain', pinyin: 'Guyu',
    meaning: 'Rain nourishes the grain: the name connects spring rainfall with crop growth. This is the last solar term of traditional spring.',
    climate: 'Rainfall increases in many areas, and plants such as duckweed and tea are growing. Northern China can still experience spring drought.',
    farming: 'Northern farmers sow when soil moisture is suitable. In the south, rice seedlings need care, and tea-growing areas are busy harvesting and processing spring tea.',
    culture: 'Some tea-growing communities enjoy Guyu tea. In certain fishing villages along the Shandong coast, ceremonies honor the sea and express hopes for safe voyages.',
  },
  {
    name: 'Start of Summer', pinyin: 'Lixia',
    meaning: 'Summer begins in the traditional seasonal calendar. This calendar boundary does not always coincide with the local meteorological start of summer.',
    climate: 'Plants flourish and frog calls become more frequent in Jiangnan. Many parts of northeastern and northwestern China are still experiencing spring.',
    farming: 'Rice fields need attention in the south. Northern farmers care for wheat as it flowers and fills with grain, watching for hot, dry winds.',
    culture: 'In Suzhou and other parts of Jiangnan, people traditionally weigh themselves and eat Lixia eggs as part of welcoming summer.',
  },
  {
    name: 'Grain Fullness', pinyin: 'Xiaoman',
    meaning: 'Grains are gradually filling on northern cereal crops. In southern traditions, fullness also suggests the increasing abundance of rain.',
    climate: 'Wheat fields begin to turn golden, and Jiangnan is busy with silkworm rearing. Prolonged rain can affect the south, while the north may face dry heat.',
    farming: 'Wheat growers support grain filling and prepare for harvest. Rice fields need adequate water, and silk-producing areas are busy reeling silk.',
    culture: 'Parts of Jiangsu and Zhejiang have traditions of prayers for silkworms. Other customs include eating bitter greens and honoring the waterwheel used in farming.',
  },
  {
    name: 'Grain in Ear', pinyin: 'Mangzhong',
    meaning: 'The name points to harvesting and sowing crops with bristled ears. Zhong here means to sow, recalling the busy transition from wheat harvest to summer planting.',
    climate: 'Wheat is golden between the Yellow and Huai rivers, while Jiangnan becomes more humid and warm. The onset of the plum-rain season varies by place and year.',
    farming: 'Farmers in the Yellow–Huai region use dry weather to harvest wheat and sow summer crops promptly. Many Yangtze rice fields need transplanting, watering and nutrients.',
    culture: 'In parts of southern Anhui, anmiao ceremonies use shaped dough offerings and other rituals to express hopes for the healthy growth of rice seedlings.',
  },
  {
    name: 'Summer Solstice', pinyin: 'Xiazhi',
    meaning: 'The Sun reaches an ecliptic longitude of 90°. Its overhead position reaches the Tropic of Cancer, and the Northern Hemisphere has its longest daylight of the year.',
    climate: 'Northern Hemisphere days are long, but land and oceans take time to accumulate heat. The hottest part of the year usually comes later.',
    farming: 'Southern areas prepare for flooding and drain fields. In the north, newly sown summer crops need care; different crops may face either drought or waterlogging.',
    culture: 'Eating solstice noodles is a custom in Beijing, Shandong and parts of Jiangnan. It also celebrates tasting the newly harvested wheat.',
  },
  {
    name: 'Minor Heat', pinyin: 'Xiaoshu',
    meaning: 'Shu means summer heat. The name suggests increasing warmth, but temperatures do not rise together across the whole country.',
    climate: 'Many regions are entering high summer. Cicadas are active in warm, humid places, while areas of concentrated rainfall need to watch for heavy downpours.',
    farming: 'Summer crops need water, nutrients and pest management. Areas growing two rice crops a year gradually prepare to harvest the early crop.',
    culture: 'Some southern rice-growing communities practice shixin, tasting new rice and giving thanks for the harvest. The date follows local tradition.',
  },
  {
    name: 'Major Heat', pinyin: 'Dashu',
    meaning: 'The name emphasizes the heat of high summer. This is the last solar term of traditional summer.',
    climate: 'Much of China experiences hot weather. Heatwaves, heavy rain and drought can affect different regions at the same time.',
    farming: 'Double-crop rice regions are busy harvesting one crop and planting the next. Cotton, maize and other crops need field care and protection from weather hazards.',
    culture: 'In places such as Jiazhi in Taizhou, Zhejiang, sending off a Dashu boat combines prayers for well-being with traditional boatbuilding and folk performances.',
  },
  {
    name: 'Start of Autumn', pinyin: 'Liqiu',
    meaning: 'Autumn begins in the traditional seasonal calendar, marking a transition in the yearly cycle.',
    climate: 'Northern mornings and evenings may begin to cool, but Jiangnan and southern China often remain hot. The term does not signal an immediate drop in temperature.',
    farming: 'Autumn crops continue to grow. Rice and maize fields need moisture and pest management as farmers prepare for the harvest.',
    culture: 'Some places eat melons to welcome autumn or meat in a custom known as tie qiubiao, traditionally intended to regain weight after summer. These customs preserve memories of earlier ways of life.',
  },
  {
    name: 'End of Heat', pinyin: 'Chushu',
    meaning: 'Chu here conveys an ending. The name expresses the expectation that summer heat will fade, though the timing differs from region to region.',
    climate: 'The difference between daytime and nighttime temperatures often increases in the north. The south may still have prolonged heat, while crops gradually ripen.',
    farming: 'Some regions harvest mid-season rice and pick cotton. Ripening autumn crops need protection from drought, strong winds and persistent rain.',
    culture: 'Some coastal communities celebrate the reopening of the fishing season around this time. Modern opening dates follow the fishing restrictions for each sea area.',
  },
  {
    name: 'White Dew', pinyin: 'Bailu',
    meaning: 'As surfaces cool at night, water vapor may condense into dew. The name evokes the bright appearance of these droplets.',
    climate: 'Autumn becomes more noticeable in the north, and some birds begin migrating. Dew also requires suitable moisture and weather conditions.',
    farming: 'Autumn grain crops are ripening or being harvested. Late rice needs water and nutrients during grain filling, with attention to the effects of low temperatures.',
    culture: 'Some communities in Jiangsu, Zhejiang and Hunan make White Dew rice wine. In places such as Fuzhou, eating longan fruit is a local custom.',
  },
  {
    name: 'Autumn Equinox', pinyin: 'Qiufen',
    meaning: 'The Sun reaches an ecliptic longitude of 180°. Its overhead position crosses the equator from north to south, with day and night close to equal in length.',
    climate: 'Northern China feels distinctly autumnal, and the Yangtze region often becomes more comfortable. Low-latitude southern areas can still be hot.',
    farming: 'Autumn harvesting, ploughing and sowing follow one another. Timely harvests help avoid damage from early frost and prolonged rain.',
    culture: 'There is an ancient tradition of honoring the Moon at the autumn equinox. Since 2018, China has designated the annual equinox as the Chinese Farmers’ Harvest Festival.',
  },
  {
    name: 'Cold Dew', pinyin: 'Hanlu',
    meaning: 'The name suggests a deeper chill than White Dew. It describes a seasonal tendency, not a promise of dew on the day itself.',
    climate: 'Northern China turns noticeably colder, and Jiangnan gains an autumn chill. Chrysanthemums bloom in many places as birds migrate south.',
    farming: 'The north continues autumn harvesting and winter-crop sowing. Southern late rice needs attention to grain filling and cold weather; rapeseed planting follows local conditions.',
    culture: 'In Henan and some other areas, climbing hills and enjoying chrysanthemums are local Hanlu traditions that bring people outdoors to observe autumn.',
  },
  {
    name: 'Frost Descent', pinyin: 'Shuangjiang',
    meaning: 'The last term of traditional autumn uses frost to evoke deepening cold. Frost forms when water vapor turns directly into ice on a surface.',
    climate: 'Parts of northern China have already seen their first frost, while the south may still be frost-free. Autumn leaf colors also vary with latitude and elevation.',
    farming: 'Northern farmers finish autumn harvests and store fruit and vegetables. Southern regions continue harvesting late rice and sowing winter crops, watching for frost.',
    culture: 'Some places eat persimmons and enjoy chrysanthemums. The white coating on dried persimmons is crystallized sugar, not frost produced by the weather.',
  },
  {
    name: 'Start of Winter', pinyin: 'Lidong',
    meaning: 'Winter begins in the traditional seasonal calendar. The idea of winter storage reflects a rhythm of gathering supplies, resting and preparing.',
    climate: 'Many northeastern and northwestern areas are already cold. Jiangnan may only be entering late autumn, while southern China often remains warm.',
    farming: 'Northern farmers protect overwintering crops and maintain growing facilities. Southern farmers finish late-rice harvests and autumn or winter sowing as local conditions allow.',
    culture: 'Some northern communities welcome winter with dumplings. Southern regions have their own winter foods, with considerable local variation.',
  },
  {
    name: 'Minor Snow', pinyin: 'Xiaoxue',
    meaning: 'The name recalls an increasing chance of snow as the season grows colder. It is distinct from the light-snow category used in weather reports.',
    climate: 'Many northern areas already have frost or snow cover, while Jiangnan may see little snow. Snowfall depends on moisture and the interaction of warm and cold air.',
    farming: 'Winter irrigation of wheat follows soil conditions. Protected crops need warmth and shelter from wind, and outdoor vegetables should be harvested in good time.',
    culture: 'Some southern communities make ciba, pounded glutinous rice cakes, or pickle vegetables. Coastal communities may dry fish, preserving harvests for winter.',
  },
  {
    name: 'Major Snow', pinyin: 'Daxue',
    meaning: 'The season is colder and conditions favorable for snow become more likely. The name does not guarantee heavy snow on the day.',
    climate: 'Northeastern China may be covered in snow, while the far south can remain relatively dry and snow-free. Winter landscapes differ greatly across the country.',
    farming: 'Northern farmers insulate livestock shelters and store fodder. Greenhouses need protection from wind and accumulated snow; southern farmers continue tending winter crops.',
    culture: 'Some Jiangnan communities begin curing meat and preparing preserved winter foods. Ice harvesting and ice-and-snow activities are another part of winter life in the northeast.',
  },
  {
    name: 'Winter Solstice', pinyin: 'Dongzhi',
    meaning: 'The Sun reaches an ecliptic longitude of 270°. Its overhead position is near the Tropic of Capricorn, and the Northern Hemisphere has its shortest daylight of the year.',
    climate: 'Northern Hemisphere days begin to lengthen after the solstice. The surface continues losing heat, however, so severe cold often lies ahead.',
    farming: 'Overwintering crops, fruit trees and livestock need protection from cold. Southern China still has winter vegetables and other fieldwork to manage.',
    culture: 'Some northern communities eat dumplings, while parts of Jiangnan eat tangyuan, glutinous rice balls. Ancestor remembrance, family gatherings and counting winter in nine-day periods have distinct local traditions.',
  },
  {
    name: 'Minor Cold', pinyin: 'Xiaohan',
    meaning: 'This term marks deepening winter cold. Minor is a traditional name; it does not mean the weather must be warmer than during Major Cold.',
    climate: 'Severe cold is common in the north, and Jiangnan must also watch for frost. In national climate averages, Minor Cold is often colder than Major Cold.',
    farming: 'Greenhouses need both insulation and careful ventilation. Farmers protect wheat, prune orchards and maintain fodder and water supplies for livestock.',
    culture: 'Counting winter in nine-day periods records the rhythm of the cold season. In Jiangnan, seeking out plum blossoms expresses hopes for spring through flowers that withstand the chill.',
    poem: {
      line: 'By the corner of the wall, a few plum branches bloom alone against the cold.',
      author: 'Wang Anshi', title: 'Plum Blossoms',
      note: 'English translation for this site.',
    },
  },
  {
    name: 'Major Cold', pinyin: 'Dahan',
    meaning: 'In the traditional sequence beginning with Start of Spring, Major Cold completes the 24 solar terms. Start of Spring comes next.',
    climate: 'Cold air remains active, but the coldest period differs by region. Even in winter, the next cycle of growth is taking shape.',
    farming: 'Farmers care for overwintering crops and livestock, repair tools, plan the next planting season and follow forecasts of cold waves.',
    culture: 'Some communities prepare New Year rice cakes, cured foods and festive supplies. Lunar New Year follows the lunisolar calendar and does not always fall within Major Cold.',
  },
];

export const terms = termContent.map((term, id) => ({
  ...chineseTerms[id],
  ...term,
  chineseName: chineseTerms[id].name,
}));

export const regionalNote = 'A solar term begins at the same astronomical instant worldwide, but clocks show different times in different time zones. The climate, plant and animal activity, and farming examples here come from different parts of China and vary with latitude, elevation and year. Traditional customs convey cultural meanings, not scientific causes or proven health benefits. Spring, summer, autumn and winter on this page follow the traditional Chinese seasonal divisions.';

const historyContent = [
  {
    date: 'Before the Qin dynasty', title: 'Reading the seasons in shadows and fields',
    text: 'Through long observation of shadows, the sky and the growth and decline of plants, people gradually recognized seasonal markers such as solstices and equinoxes. This knowledge accumulated over time; it was not invented by one person on a single day.',
  },
  {
    date: 'Western Han dynasty', title: 'Twenty-four names form a system',
    text: 'The Astronomy chapter of the Huainanzi records a complete system whose names and sequence largely correspond to those used today. Ancient accounts did not always begin with Start of Spring; some began with the Winter Solstice.',
  },
  {
    date: '104 BCE', title: 'Solar terms become part of the calendar',
    text: 'The Taichu calendar, introduced under Emperor Wu of Han, coordinated seasons and months using solar terms and used the principal terms to determine intercalary months. Solar terms follow the Sun; months follow lunar phases. Together they form a lunisolar calendar.',
  },
  {
    date: 'Across generations', title: 'From farming knowledge to everyday culture',
    text: 'Proverbs, foods, festivals and crafts pass seasonal knowledge to new generations. Modern solar terms use fixed intervals of solar longitude, known as dingqi. This differs from the historical pingqi method, which divided the year into equal time intervals.',
  },
  {
    date: '2016', title: 'Recognized as a shared human heritage',
    text: 'UNESCO inscribed the Twenty-Four Solar Terms—the Chinese knowledge of time and associated practices developed by observing the Sun’s annual motion—on the Representative List of the Intangible Cultural Heritage of Humanity.',
  },
];

export const history = historyContent.map((entry, index) => ({
  ...chineseHistory[index],
  ...entry,
}));

const songExplanations = [
  'In order: Start of Spring, Rain Water, Awakening of Insects, Spring Equinox, Pure Brightness and Grain Rain. The first 春 means Start of Spring; the second means Spring Equinox. 天 completes the rhythm and is not a separate term.',
  'In order: Start of Summer, Grain Fullness, Grain in Ear and Summer Solstice, followed by Minor Heat and Major Heat. The first 夏 means Start of Summer; the second means Summer Solstice. The single 暑 (shu) stands for both heat terms: select Minor Heat or Major Heat separately. 相连 means that they follow one another.',
  'In order: Start of Autumn, End of Heat, White Dew, Autumn Equinox, Cold Dew and Frost Descent. The first 秋 means Start of Autumn; the second means Autumn Equinox. Here 寒 means Cold Dew, and 霜降 is one complete term.',
  'In order: Start of Winter, Minor Snow, Major Snow, Winter Solstice, Minor Cold and Major Cold. The first 冬 means Start of Winter; the second means Winter Solstice. The two 雪 characters refer to Minor Snow, then Major Snow. 小大寒 pairs the two cold terms; the final 寒 is shared and is not a separate term.',
];

// Preserve the Chinese mnemonic and its exact click targets in every locale.
export const songLines = chineseSongLines.map((line, index) => ({
  ...line,
  tokens: line.tokens.map((token) => ({
    ...token,
    ...(token.termIds ? { termIds: [...token.termIds] } : {}),
  })),
  explanation: songExplanations[index],
}));

export const science = [
  {
    title: 'What causes the seasons?',
    text: 'Earth’s axis is tilted about 23.4° from a line perpendicular to its orbital plane, and it points in nearly the same direction in space throughout a year. As Earth orbits, the angle of sunlight and the length of daylight change. When the Northern Hemisphere tilts toward the Sun, sunlight is more direct and days are longer; the Southern Hemisphere experiences the opposite. Changes in Earth–Sun distance are not the main cause of the seasons.',
  },
  {
    title: 'Where is solar longitude measured from?',
    text: 'Solar longitude describes the Sun’s apparent position along the ecliptic as seen from Earth. It starts at 0° at the spring equinox point and increases along the Sun’s annual apparent path. Earth’s position around the Sun uses a heliocentric viewpoint: in a simplified model, the Earth-to-Sun and Sun-to-Earth directions are opposite, differing by 180°. A 3D scene may choose another coordinate origin, but it must preserve this relationship.',
  },
  {
    title: 'Why not one term every 15 days?',
    text: 'Successive solar terms are separated by 15° of solar longitude, not exactly 15 days. Earth’s orbit is nearly circular but still elliptical, and its orbital speed varies. Intervals between terms are therefore usually about 14.7–15.7 days. Dividing a year into 24 equal time intervals cannot replace astronomical calculation.',
  },
  {
    title: 'Why are Gregorian dates fairly stable?',
    text: 'Solar terms follow the Sun’s annual apparent motion. The Gregorian calendar also tracks the tropical year, using leap years to stay aligned. A given term therefore usually falls on similar Gregorian dates. A tropical year is not a whole number of days, so leap years and orbital variations shift the precise time.',
  },
  {
    title: 'A starting instant or an interval?',
    text: 'A term begins at the instant the Sun reaches its specified longitude. The interval lasts from that instant up to, but not including, the start of the next term. Times here are shown in Beijing time, Asia/Shanghai (UTC+8). The same instant can have a different clock time—or even a different date—in another time zone.',
  },
  {
    title: 'Are solar terms weather forecasts?',
    text: 'No. Solar terms have precise astronomical definitions, while their names and traditional observations of plants and animals developed mainly in China’s Yellow River basin and were later adapted elsewhere. Start of Spring does not mean spring arrives everywhere, and Frost Descent does not promise frost that day. Farming decisions also depend on local climate, crop varieties and weather forecasts.',
  },
];

export const culturalValues = [
  {
    title: 'A calendar for the fields',
    text: 'Grain in Ear links the wheat harvest to summer sowing. Grain Fullness connects developing wheat with Jiangnan’s silkworm season. Solar terms make farming experience easier to remember and can still be considered alongside weather observations and local agricultural guidance.',
  },
  {
    title: 'Food, family and seasonal memories',
    text: 'Spring pancakes, green qingtuan rice cakes, summer-solstice noodles and winter-solstice tangyuan each have regional stories. They connect local produce, family gatherings and a sense of season. No single food tradition represents every Chinese household.',
  },
  {
    title: 'Observing nature through poetry',
    text: 'Du Fu’s Delighting in Rain on a Spring Night describes rain that knows its season; Wang Anshi’s Plum Blossoms portrays flowers opening alone against the cold. These are translated descriptions of the poems. Poetry preserves human experience, while science explains the roles of light, temperature, water and living processes.',
  },
  {
    title: 'A living cultural heritage',
    text: 'Solar-term knowledge continues through families, schools, farming and local festivals. Safeguarding this heritage means valuing customs and their regional differences while understanding how cultural meanings and modern scientific explanations express different kinds of knowledge.',
  },
];

const referenceTitles = {
  hko: 'Hong Kong Observatory | The 24 solar terms and solar longitude',
  unesco: 'UNESCO | Official decision on inscription in 2016',
  'unesco-project': 'UNESCO | The Twenty-Four Solar Terms (00647)',
  history: 'Institute for the History of Natural Sciences, CAS | Development and standardization of the solar terms',
  'history-order': 'China Intangible Cultural Heritage Network | Which solar term comes first?',
  agri: 'China Agricultural Museum | The 24 solar terms',
  nasa: 'NASA Space Place | What causes the seasons?',
  'cma-names': 'China Meteorological Administration | How the solar terms were named',
  'cma-song': 'China Meteorological Administration | The solar-term song and cultural transmission',
  'cma-lichun': 'China Meteorological Administration | Start of Spring and the arrival of spring weather',
  yushui: '12371.cn | Local Rain Water customs',
  'jingzhe-science': 'Chinese Government / China Meteorological Administration | Jingzhe weather and farming',
  'jingzhe-culture': '12371.cn | Awakening of Insects customs',
  chunfen: 'Chinese Government / China Meteorological Administration | The spring equinox season',
  qingming: '12371.cn | Qingming customs',
  guyu: 'China Meteorological Administration | The meaning of Grain Rain',
  'guyu-culture': 'China Agricultural Museum | Grain Rain farming and sea ceremonies',
  lixia: 'Suzhou Local Chronicles Office | Start of Summer in Suzhou',
  xiaoman: 'China Meteorological News | Grain Fullness farming and customs',
  mangzhong: 'China Traditional Culture Promotion Association | Anmiao at Grain in Ear',
  xiazhi: '12371.cn / CCTV | Summer-solstice noodles',
  xiaoshu: 'Xinjian District Government, Nanchang | Minor Heat farming and tasting new rice',
  'dashu-climate': 'China Meteorological Administration | Major Heat climate and farming',
  'dashu-culture': 'Folk Literature and Art Development Center, Ministry of Culture and Tourism | Sending off the Dashu boat',
  chushu: 'China Meteorological News | End of Heat weather and the reopening of coastal fishing',
  liqiu: 'Hubei Intangible Cultural Heritage Network | Local Start of Autumn customs',
  bailu: 'Xinhua | Regional White Dew foods',
  qiufen: 'China Meteorological News | Autumn Equinox farming and culture',
  harvest: 'Chinese Government | Establishing the Chinese Farmers’ Harvest Festival',
  hanlu: 'China Meteorological News | The Cold Dew season',
  shuangjiang: 'China Meteorological News | Frost Descent farming and regional food customs',
  lidong: 'China Meteorological Administration | Start of Winter and regional climates',
  xiaoxue: 'China Agricultural Museum | Minor Snow and seasonal foods',
  daxue: 'China Meteorological News | Does Major Snow always bring snow?',
  'daxue-culture': 'China Meteorological News | Major Snow, ice harvesting and preserved foods',
  dongzhi: 'China Meteorological News | Winter Solstice daylight and customs',
  xiaohan: 'China Meteorological News | Comparing Minor Cold and Major Cold temperatures',
  dahan: 'Kaifeng official website | Major Cold and winter rice cakes',
};

// Keep every original reference URL and ID unchanged; only localize its title.
export const references = chineseReferences.map((reference) => ({
  ...reference,
  title: referenceTitles[reference.id],
}));
