// A term's index follows the traditional sequence from Lichun to Dahan.
// Each text pair is [Simplified Chinese, English].
const entries = [
  {
    zh: "立春",
    illustration: "spring.webp",
    illustrationAlt: ["梅花映着初绿的溪谷。", "Plum blossom overlooks a valley just turning green."],
    en: "Beginning of Spring",
    meaning: [
      "“立”是开始。传统历法从这一天算起春季，北方许多地方仍在过冬。",
      "The traditional spring begins here. Much of northern China is still in the grip of winter.",
    ],
    nature: [
      "江南的梅花陆续开放，黄河以北的河面却可能仍封着冰。",
      "Plum blossoms appear south of the Yangtze while rivers north of the Yellow River may still be frozen.",
    ],
    farm: [
      "暖地备耕育苗，寒地农户可趁田间农活较少时检修农具。",
      "Growers in milder areas prepare seedbeds. In colder places, farmers use the quieter weeks to repair tools.",
    ],
    custom: [
      "北方一些家庭用薄春饼卷上时蔬，以“咬春”迎新岁。",
      "In parts of northern China, families roll vegetables in thin pancakes to take a symbolic bite of spring.",
    ],
  },
  {
    zh: "雨水",
    illustration: "terms/yushui.webp",
    illustrationAlt: ["细雨落在江南石桥和水面上。", "Spring rain falls on a stone bridge and a canal in Jiangnan."],
    en: "Rain Water",
    meaning: [
      "名字描绘初春冰雪消融、雨水渐多的景象。",
      "The name evokes melting snow and the return of spring rain.",
    ],
    nature: [
      "江南湿润的日子渐多，北方土壤解冻的早晚则随纬度而变。",
      "Damp days become more frequent south of the Yangtze. Farther north, the date of the thaw varies with latitude.",
    ],
    farm: [
      "麦田返青前，农人查看土壤水分，干处保墒，积水处开沟。",
      "Before winter wheat greens up, growers check the soil, conserving moisture in dry fields and draining wet ones.",
    ],
    custom: [
      "四川部分地方有“拉保保”的旧俗，家人为孩子认干亲，寄托平安长大的心愿。",
      "In parts of Sichuan, parents traditionally chose a godparent for a child at this time, wishing the child a safe childhood.",
    ],
  },
  {
    zh: "惊蛰",
    illustration: "terms/jingzhe.webp",
    illustrationAlt: ["桃枝间的小虫与雨后春色。", "Insects among peach branches after spring rain."],
    en: "Awakening of Insects",
    meaning: [
      "“蛰”指动物藏伏越冬。古人用一声春雷写下小生灵重又活动的景象。",
      "The name pictures a clap of spring thunder rousing creatures that sheltered through winter.",
    ],
    nature: [
      "越冬昆虫的活动受温度等条件影响。南方初雷和北方初雷往往相隔数周。",
      "Warmer conditions bring overwintering insects out of dormancy. The first thunderstorms in northern and southern China can be weeks apart.",
    ],
    farm: [
      "果农巡查枝条上的越冬虫卵，按本地虫情安排防治。",
      "Orchard growers inspect branches for overwintering eggs and plan pest control around what they find.",
    ],
    custom: [
      "山西等地有惊蛰吃梨的习惯，一枚春梨也是节令的记号。",
      "In Shanxi and some neighbouring areas, eating a pear is a familiar way to mark the day.",
    ],
  },
  {
    zh: "春分",
    illustration: "terms/chunfen.webp",
    illustrationAlt: ["江南村落旁的油菜花田。", "Yellow rapeseed fields surround a Jiangnan village."],
    en: "Spring Equinox",
    meaning: [
      "太阳自南向北越过天赤道。传统春季行至中点，各地昼夜大致等长。",
      "The Sun crosses the celestial equator northward. Day and night are nearly equal in length around the world.",
    ],
    nature: [
      "黄淮一带小麦陆续拔节，江南的油菜田常已开出大片黄花。",
      "Wheat stems lengthen on the Yellow and Huai river plains, while rapeseed fields may already be yellow south of the Yangtze.",
    ],
    farm: [
      "江南农户管理开花的油菜，雨多时及时疏沟排水。",
      "In the lower Yangtze region, growers keep drainage channels clear around flowering rapeseed.",
    ],
    custom: [
      "湖南安仁的“赶分社”会聚乡亲，祈求丰收，也交易农具和物产。",
      "At the spring fair in Anren, Hunan, people pray for a harvest and trade tools and local produce.",
    ],
  },
  {
    zh: "清明",
    illustration: "terms/qingming.webp",
    illustrationAlt: ["江南山坡的春茶采摘。", "Pickers gather spring tea on a Jiangnan hillside."],
    en: "Clear and Bright",
    meaning: [
      "“清明”写春日天地清朗的景象。这一天也承载着祭祖怀亲的节日传统。",
      "The name evokes a clear, bright spring landscape. Qingming is also a festival for remembering ancestors.",
    ],
    nature: [
      "江南柳枝抽绿，茶树吐芽。山区气温较低，春芽往往来得更迟。",
      "Willows green and tea plants put out new shoots south of the Yangtze. Buds often open later at higher elevations.",
    ],
    farm: [
      "江南茶区分批采春茶。茶园海拔、品种和当年气温都会影响采期。",
      "Tea growers pick spring shoots in successive rounds. Elevation, cultivar and the weather all affect the timing.",
    ],
    custom: [
      "许多家庭扫墓、踏青。江南一些地方用草汁和糯米粉做青团。",
      "Families tend graves and walk in the spring countryside. In parts of the lower Yangtze, herb juice colours sticky rice cakes green.",
    ],
  },
  {
    zh: "谷雨",
    illustration: "terms/guyu.webp",
    illustrationAlt: ["春雨中的水稻秧田。", "Young rice seedlings in spring rain."],
    en: "Grain Rain",
    meaning: [
      "暮春雨水滋养新苗，“谷雨”把春播作物与雨的关系写进了名字。",
      "This last term of spring takes its name from the rain that nourishes newly sown grain.",
    ],
    nature: [
      "江南秧田渐绿，部分地区雨日增多。北方春旱年份仍可能久候甘霖。",
      "Rice nurseries green up in the south as rains grow more frequent in some places. Northern fields may still be waiting for rain.",
    ],
    farm: [
      "适合水稻育秧的地方，农户照看苗床，按气温调节覆盖和通风。",
      "Where rice nurseries are under way, growers cover or ventilate the seedlings as temperatures change.",
    ],
    custom: [
      "山东胶东一些渔村在谷雨祭海，祈愿出海平安、鱼获丰足。",
      "Several fishing villages on the Jiaodong Peninsula in Shandong hold sea rites for safe voyages and a good catch.",
    ],
  },
  {
    zh: "立夏",
    illustration: "terms/lixia.webp",
    illustrationAlt: ["初夏菜园里新收的蚕豆。", "Freshly picked broad beans in an early-summer garden."],
    en: "Beginning of Summer",
    meaning: [
      "传统夏季从立夏起算。草木生长加快，田野的颜色逐日加深。",
      "The traditional summer begins as new growth thickens and the green in the fields deepens.",
    ],
    nature: [
      "长江下游的蚕豆、豌豆陆续成熟，东北一些地方才开始春播。",
      "Broad beans and peas ripen in the lower Yangtze valley while spring sowing is just beginning in parts of the northeast.",
    ],
    farm: [
      "冬小麦产区留意扬花和灌浆进度，稻区照料刚下田的秧苗。",
      "Wheat growers watch flowering and grain development. In rice districts, newly transplanted seedlings need tending.",
    ],
    custom: [
      "杭州半山保留着立夏“称人”的习俗，人们坐上大秤，相互送上吉利话。",
      "In Banshan, Hangzhou, people traditionally take turns on a large weighing scale while neighbours offer good wishes.",
    ],
  },
  {
    zh: "小满",
    illustration: "terms/xiaoman.webp",
    illustrationAlt: ["黄淮平原上正在灌浆的青麦穗。", "Green wheat ears fill with grain on the Huang-Huai plain."],
    en: "Grain Buds",
    meaning: [
      "“小满”描绘麦粒开始饱满、尚未熟透的样子。",
      "Winter wheat kernels are filling out but have yet to ripen. The name captures this moment of almost being full.",
    ],
    nature: [
      "黄淮麦田里，青麦穗渐渐沉实。江南一些蚕区也进入结茧时节。",
      "Green wheat heads grow heavier on the Yellow and Huai river plains. In some southern silk districts, silkworms start spinning cocoons.",
    ],
    farm: [
      "麦农在灌浆期留意干热风，养蚕人则为熟蚕预备结茧的支架。",
      "Wheat growers watch for hot, dry winds as grain fills. Silk farmers prepare frames for silkworms to spin on.",
    ],
    custom: [
      "江南蚕乡旧时有小满祭蚕神的习俗，以供奉和演戏祈愿蚕茧丰收。",
      "Silk-growing communities south of the Yangtze traditionally made offerings and staged plays for a good cocoon harvest.",
    ],
  },
  {
    zh: "芒种",
    illustration: "terms/mangzhong.webp",
    illustrationAlt: ["金黄麦田里的收割。", "Harvest in a field of ripe golden wheat."],
    en: "Grain in Ear",
    meaning: [
      "“芒”是麦穗等伸出的细刺。芒种时节，一边收麦，一边赶着播种。",
      "The name refers to the bristles on grain heads. Wheat harvest and the sowing of summer crops come close together.",
    ],
    nature: [
      "黄淮平原麦穗转黄，江淮一带空气中水汽渐多。",
      "Wheat turns golden on the Yellow and Huai river plains, and humidity builds between the Yangtze and Huai rivers.",
    ],
    farm: [
      "北方部分麦区抢晴收割，长江流域部分稻田正忙着插秧。",
      "Farmers use dry spells to harvest northern wheat, while transplanting keeps rice growers busy in parts of the Yangtze valley.",
    ],
    custom: [
      "浙江云和梅源山区举行开犁节，农人牵牛下田，拉开当地夏耕的序幕。",
      "At the ploughing festival in Meiyuan, Zhejiang, farmers lead cattle into the fields to open the summer growing season.",
    ],
  },
  {
    zh: "夏至",
    illustration: "terms/xiazhi.webp",
    illustrationAlt: ["北方河滩上迟迟未尽的暮光。", "Late evening light lingers over a northern river."],
    en: "Summer Solstice",
    meaning: [
      "太阳直射点到达北回归线附近。北半球迎来一年中白昼最长的时节。",
      "The midday Sun is overhead near the Tropic of Cancer, and the Northern Hemisphere reaches its longest days.",
    ],
    nature: [
      "长江中下游常处在梅雨季。北方高纬度地区，天黑得格外晚。",
      "The middle and lower Yangtze are often in the plum rain season. At higher northern latitudes, daylight lasts well into the evening.",
    ],
    farm: [
      "江淮低洼田防积涝，北方已完成麦收的田块接着管理夏播作物。",
      "Waterlogged fields need draining in the Yangtze–Huai region. Farther north, summer crops follow the wheat harvest.",
    ],
    custom: [
      "在北京等地，人们吃夏至面，刚收下的新麦由此端上餐桌。",
      "In Beijing and other wheat-growing regions, solstice noodles bring the new wheat harvest to the table.",
    ],
  },
  {
    zh: "小暑",
    illustration: "summer.webp",
    illustrationAlt: ["夏日溪畔的荷花。", "Lotus flowers bloom beside a summer stream."],
    en: "Minor Heat",
    meaning: [
      "“暑”指炎热。小暑标出夏热渐盛的阶段。",
      "Summer heat is building. This is the first of two terms that describe its intensity.",
    ],
    nature: [
      "江南池塘里荷花盛开，北方部分地区进入雷阵雨较多的时段。",
      "Lotus flowers open on southern ponds, and thunderstorms become more frequent in parts of the north.",
    ],
    farm: [
      "夏播的玉米、棉花生长旺盛，农户查看虫害，也留意雷雨后的排水。",
      "Growers check summer maize and cotton for insects and drain standing water after thunderstorms.",
    ],
    custom: [
      "鲁南、苏北一带有吃“暑羊”的习惯，盛夏喝上一碗羊肉汤。",
      "In southern Shandong and northern Jiangsu, a bowl of mutton soup is a traditional midsummer meal.",
    ],
  },
  {
    zh: "大暑",
    illustration: "terms/dashu.webp",
    illustrationAlt: ["南方双季稻田里收早稻、插晚稻的景象。", "Early rice harvest and late rice planting in southern China."],
    en: "Major Heat",
    meaning: [
      "“大暑”点出盛夏热势。许多地方的气温高峰落在夏至之后。",
      "Major Heat marks high summer. In many places temperatures peak several weeks after the longest day.",
    ],
    nature: [
      "长江流域部分年份高温少雨，华南沿海则须留意台风带来的风雨。",
      "Some summers bring hot, dry spells to the Yangtze valley. Typhoons can bring heavy rain to the southern coast.",
    ],
    farm: [
      "南方双季稻区忙着收早稻、栽晚稻，当地称作“双抢”。",
      "Where two rice crops share the same field, farmers race to harvest early rice and transplant the late crop.",
    ],
    custom: [
      "浙江台州椒江渔村有送大暑船的仪式，造船、巡游和表演由社区共同完成。",
      "Fishing communities in Jiaojiang, Zhejiang, build a ceremonial summer boat and accompany it with a procession and performances.",
    ],
  },
  {
    zh: "立秋",
    illustration: "terms/liqiu.webp",
    illustrationAlt: ["北方玉米田里的初秋晨光。", "Early-autumn morning light on a northern cornfield."],
    en: "Beginning of Autumn",
    meaning: [
      "传统秋季从此开始。白昼已渐短，暑热在许多地方仍会延续。",
      "The traditional autumn begins. Daylight is shortening, though summer heat often lingers.",
    ],
    nature: [
      "北方一些地方早晚渐凉，长江以南仍可能经历连续高温。",
      "Mornings and evenings cool in parts of the north while heat can persist for days south of the Yangtze.",
    ],
    farm: [
      "北方春玉米进入籽粒生长阶段，稻区继续管好晚稻水层。",
      "Northern spring maize is developing grain. In southern double-crop districts, farmers manage water for late rice.",
    ],
    custom: [
      "湘西部分苗族社区在立秋赶秋，荡秋千、唱歌，借节庆走亲会友。",
      "Some Miao communities in western Hunan gather for an autumn festival with swings, singing and visits to friends.",
    ],
  },
  {
    zh: "处暑",
    illustration: "terms/chushu.webp",
    illustrationAlt: ["暑气渐退，稻田里抽出新穗。", "Fresh rice panicles emerge as the heat eases."],
    en: "End of Heat",
    meaning: [
      "“处”在这里有终止的意思。处暑记下暑热渐退的时节。",
      "The name marks the gradual retreat of summer heat.",
    ],
    nature: [
      "北方夜温下降，南方有时仍遇“秋老虎”，晴天午后依然炎热。",
      "Northern nights cool down. In the south, spells of hot autumn weather can keep afternoons sweltering.",
    ],
    farm: [
      "长江流域部分稻田开始抽穗扬花，农户随天气调水护穗。",
      "Rice in parts of the Yangtze basin begins to flower. Farmers adjust water levels as the weather changes.",
    ],
    custom: [
      "北京一带有处暑吃鸭的习俗，有些人会特意买一份百合鸭带回家。",
      "In Beijing, some families mark the season by bringing home a dish of duck cooked with lily bulbs.",
    ],
  },
  {
    zh: "白露",
    illustration: "terms/bailu.webp",
    illustrationAlt: ["晨露凝在芦苇上，雁群掠过湿地。", "Dew on reeds as migrating geese cross a marsh."],
    en: "White Dew",
    meaning: [
      "晴夜里叶面散热变凉，水汽凝成露珠。清晨的露光给了节气名字。",
      "Leaves cool under clear night skies. Water vapour condenses on them, and the bright droplets give this term its name.",
    ],
    nature: [
      "北方不少地方昼夜温差拉大，迁徙的鸟群沿各自的路线南行。",
      "Across much of northern China, nights grow noticeably cooler than days. Migrating birds follow their routes south.",
    ],
    farm: [
      "部分东北稻区的水稻进入成熟期，农户留意早霜，察看稻谷成色。",
      "In parts of the northeast, rice approaches maturity. Farmers check the grain and watch forecasts for early frost.",
    ],
    custom: [
      "古歌《诗经·秦风·蒹葭》（佚名）以“蒹葭苍苍，白露为霜”起兴。",
      "An anonymous song in the Book of Songs, “The Reeds” from the Airs of Qin, opens on reeds and white dew turned to frost.",
    ],
  },
  {
    zh: "秋分",
    illustration: "landscape.webp",
    illustrationAlt: ["夕阳下，山谷草木渐染秋金。", "The valley turns gold in the autumn evening light."],
    en: "Autumn Equinox",
    meaning: [
      "太阳自北向南越过天赤道。传统秋季过半，昼夜再次大致等长。",
      "The Sun crosses the celestial equator southward. Day and night are nearly equal again, halfway through the traditional autumn.",
    ],
    nature: [
      "许多北方田野进入收获季。秋分以后，北半球中纬度的夜晚渐长于白昼。",
      "Harvest colours spread over northern fields. Nights begin to outlast days across the northern middle latitudes.",
    ],
    farm: [
      "秋收、秋耕、秋种接续展开，麦区要兼顾收玉米和准备冬小麦种床。",
      "Harvest, tillage and sowing overlap. In wheat districts, farmers make seedbeds for winter wheat after bringing in maize.",
    ],
    custom: [
      "自2018年起，中国把每年秋分设为中国农民丰收节，各地以农产品和农事活动庆收成。",
      "Since 2018, China has marked the equinox with the Chinese Farmers’ Harvest Festival, celebrating local produce and farming skills.",
    ],
  },
  {
    zh: "寒露",
    illustration: "terms/hanlu.webp",
    illustrationAlt: ["江南园墙边盛开的秋菊。", "Autumn chrysanthemums beside a Jiangnan garden wall."],
    en: "Cold Dew",
    meaning: [
      "露意更凉，秋意渐深。这个名字让人想到深秋清早的湿冷。",
      "Cooler nights lend the dew its chilly name, evoking the feel of a late-autumn morning.",
    ],
    nature: [
      "华北落叶树渐次变色，江南的菊花也陆续绽放。",
      "Deciduous trees begin to change colour across parts of northern China, while chrysanthemums open farther south.",
    ],
    farm: [
      "黄淮冬麦区按土温和品种安排播种。南方晚稻区留意冷空气。",
      "Winter wheat sowing on the Yellow and Huai river plains depends on soil temperature and cultivar. Southern rice growers watch for cold spells.",
    ],
    custom: [
      "江南一些地方赏菊、品蟹，水边还有“秋钓边”的垂钓习惯。",
      "Chrysanthemum viewing, seasonal crab dishes and fishing in the shallows feature in autumn life south of the Yangtze.",
    ],
  },
  {
    zh: "霜降",
    illustration: "terms/shuangjiang.webp",
    illustrationAlt: ["柿树下的红叶覆着薄霜。", "Frost edges fallen leaves beneath a persimmon tree."],
    en: "Frost Descent",
    meaning: [
      "“霜降”写深秋地物表面可能结霜的景象。霜由水汽在寒冷表面直接凝华而成。",
      "The name evokes frosty late-autumn mornings. Frost can form when water vapour turns directly into ice on a cold surface.",
    ],
    nature: [
      "北方许多地方初霜前后叶色转深。沿海暖地的初霜常来得更晚。",
      "Leaves deepen in colour around the first frosts in much of northern China. Warmer coastal areas may see frost considerably later.",
    ],
    farm: [
      "怕冻的菜蔬要赶在当地霜冻前收贮，已播冬麦的地块则查看出苗。",
      "Frost-sensitive vegetables are gathered ahead of local freezes. Growers check the emergence of newly sown winter wheat.",
    ],
    custom: [
      "广西天等、大新等地保有壮族霜降节，村镇以集会、歌舞联络乡亲。",
      "Zhuang communities in Tiandeng, Daxin and nearby Guangxi counties hold a Frost Descent festival with gatherings, song and dance.",
    ],
  },
  {
    zh: "立冬",
    illustration: "terms/lidong.webp",
    illustrationAlt: ["北方农家庭院里备贮的秋菜。", "Autumn vegetables gathered for winter in a northern courtyard."],
    en: "Beginning of Winter",
    meaning: [
      "“立”是开始，“冬”有冬藏之意。秋收渐息，传统历法由此入冬。",
      "The traditional winter begins as the autumn harvest winds down and crops are put away for the cold months.",
    ],
    nature: [
      "北方寒意渐浓，草木凋落。江南仍可见秋色，岭南一些地方尚暖。",
      "Leaves fall as northern China grows colder. Autumn colour lingers south of the Yangtze, and the far south can still feel warm.",
    ],
    farm: [
      "北方农户收贮秋菜、检查粮仓，江南部分田块仍在收晚稻、种冬麦。",
      "Northern households store vegetables and check grain bins. Some southern fields are still yielding late rice or being sown to wheat.",
    ],
    custom: [
      "绍兴一带在立冬前后开酿冬酒，北方一些家庭则用一顿饺子迎冬。",
      "Around Shaoxing, the winter rice-wine brewing season gets under way. In parts of the north, families welcome winter with dumplings.",
    ],
  },
  {
    zh: "小雪",
    illustration: "winter.webp",
    illustrationAlt: ["山岭和松枝上落着薄雪。", "A light dusting of snow on mountain ridges and pine branches."],
    en: "Minor Snow",
    meaning: [
      "传统上用“小雪”标记寒意加深、降水可能由雨转雪的时段。",
      "Minor Snow marks the deepening cold, when some precipitation may begin to fall as snow.",
    ],
    nature: [
      "东北部分地方已有积雪，长江以南许多低地仍以降雨为主。",
      "Snow may already cover parts of the northeast, while many southern lowlands still mostly receive rain.",
    ],
    farm: [
      "降温前，菜农给不耐寒蔬菜加盖防护，贮藏的薯类要防冻。",
      "Before a cold spell, growers cover tender vegetables and protect stored potatoes and sweet potatoes from freezing.",
    ],
    custom: [
      "江浙一些家庭趁天气转凉腌制冬菜，保存秋收时的蔬菜。",
      "In parts of Jiangsu and Zhejiang, cooler weather marks the start of winter pickling, preserving vegetables from the autumn harvest.",
    ],
  },
  {
    zh: "大雪",
    illustration: "terms/daxue.webp",
    illustrationAlt: ["厚雪覆盖北方山村的屋顶和松枝。", "Heavy snow blankets the roofs and pines of a northern village."],
    en: "Major Snow",
    meaning: [
      "“大雪”记下隆冬渐近、部分地区积雪机会增加的季候。",
      "The name marks the approach of deep winter and a greater chance of lasting snow in colder regions.",
    ],
    nature: [
      "严寒地区雪层可覆盖田野，华南不少地方整个冬季也难见雪。",
      "Snow can blanket fields in cold districts, while parts of southern China rarely see it even in midwinter.",
    ],
    farm: [
      "牧区储备草料，设施农业区在降雪后及时清理棚顶积雪。",
      "Herders lay in fodder, and greenhouse growers clear accumulated snow from roofs after storms.",
    ],
    custom: [
      "南京等地有大雪腌肉的老习惯，人们用盐和香料处理肉，留作年节食材。",
      "In places such as Nanjing, families traditionally cure meat with salt and spices for the coming festive season.",
    ],
  },
  {
    zh: "冬至",
    illustration: "terms/dongzhi.webp",
    illustrationAlt: ["冬日低阳让庭院里的测影杆投下长影。", "A low winter sun casts a long shadow from a courtyard gnomon."],
    en: "Winter Solstice",
    meaning: [
      "太阳直射点到达南回归线附近。北半球白昼最短，此后日照时间逐渐增长。",
      "The midday Sun is overhead near the Tropic of Capricorn. Northern days reach their shortest and then begin to lengthen.",
    ],
    nature: [
      "北半球中纬度正午太阳低、影子长。陆地和海洋仍在散失夏秋储下的热量。",
      "At northern middle latitudes, the low midday Sun casts long shadows. Land and sea continue to give up stored heat.",
    ],
    farm: [
      "北方冬麦田检查越冬苗情，南方露地菜田防备寒潮。",
      "Northern farmers inspect dormant winter wheat. Growers of outdoor vegetables in the south prepare for cold waves.",
    ],
    custom: [
      "苏州有做冬至团的习俗，糯米粉包上各色馅料，馈赠亲友。",
      "In Suzhou, families make filled sticky rice balls and share them as solstice gifts with relatives and friends.",
    ],
  },
  {
    zh: "小寒",
    illustration: "terms/xiaohan.webp",
    illustrationAlt: ["冰池旁的蜡梅开出黄色花朵。", "Golden wintersweet blossoms beside a frozen pond."],
    en: "Minor Cold",
    meaning: [
      "“小寒”标记隆冬的一段寒时。在部分地区，小寒也可能是一年最冷的节气。",
      "Minor Cold falls in deep winter. In some regions it can be the coldest term of the year.",
    ],
    nature: [
      "北方河湖冰层渐厚，江南庭院里的蜡梅可能已经吐香。",
      "Ice thickens on northern rivers and lakes. Wintersweet may already scent gardens south of the Yangtze.",
    ],
    farm: [
      "果园选晴天冬剪，设施菜地在保温之余也要选择合适时段通风。",
      "Orchard keepers choose dry weather for winter pruning. Greenhouse growers balance warmth with ventilation.",
    ],
    custom: [
      "南京有小寒吃菜饭的习俗，把青菜和米同煮，有时还加入咸肉。",
      "In Nanjing, a traditional Minor Cold dish combines rice, leafy greens and sometimes cured pork in one pot.",
    ],
  },
  {
    zh: "大寒",
    illustration: "terms/dahan.webp",
    illustrationAlt: ["寒风扫过结冰的北方河面。", "Winter wind sweeps a frozen river in northern China."],
    en: "Major Cold",
    meaning: [
      "大寒是传统顺序中的最后一个节气，写尽岁末寒意，再往前便是立春。",
      "Major Cold closes the traditional sequence in the depths of winter. The next turn of the cycle brings the Beginning of Spring.",
    ],
    nature: [
      "强冷空气仍会南下。北方田野多在休眠，温暖地区已有早梅开放。",
      "Cold air can still sweep south. Much northern farmland lies dormant while early plum blossoms appear in milder places.",
    ],
    farm: [
      "农户检修排灌设备、整理种子，也照看越冬牲畜的饮水和饲料。",
      "Farmers service irrigation equipment, sort seed and keep overwintering livestock supplied with water and fodder.",
    ],
    custom: [
      "大寒临近农历年节，许多家庭开始办年货、备糕点，各地年味各有不同。",
      "As Lunar New Year draws near, households begin buying festive supplies and preparing cakes that vary from region to region.",
    ],
  },
];

export const terms = entries.map((entry, index) => ({
  ...entry,
  longitude: (315 + 15 * index) % 360,
  season: Math.floor(index / 6),
}));

export const history = [
  {
    date: ["先秦", "Before 221 BCE"],
    text: [
      "黄河流域的先民留心花开、鸟至和农作时令，也立表观察正午的日影。夏至前后影短，冬至前后影长，太阳给一年留下了可重复观测的刻度。",
      "In the Yellow River basin, observers tracked flowering, bird arrivals and the shadow of an upright pole at noon. Its shortest and longest shadows marked the two solstices.",
    ],
  },
  {
    date: ["西汉前期", "Early Western Han"],
    text: [
      "《淮南子·天文训》已经依次记下完整的二十四节气。对日影和季节的长期观察，在文献中有了一套完整的名称。",
      "The astronomy chapter of the Huainanzi records the full sequence of twenty-four named terms, bringing centuries of seasonal observation together in one text.",
    ],
  },
  {
    date: ["公元前104年", "104 BCE"],
    text: [
      "汉武帝颁行《太初历》，把二十四节气纳入官方历法。历家用节气协调按月相划分的月份与四季。",
      "Emperor Wu adopted the Taichu calendar. Its use of solar terms helped keep months based on the Moon’s phases in step with the seasons.",
    ],
  },
  {
    date: ["1645年", "1645"],
    text: [
      "清初《时宪历》正式采用定气法，以太阳在黄道上每走过15°定一个节气。今天的交节时刻仍按这一角度原则计算。",
      "The Shixian calendar made a solar advance of 15° the official measure of a term. The same angular rule determines the transitions today.",
    ],
  },
  {
    date: ["2016年至今", "2016 to the present"],
    text: [
      "二十四节气及相关实践列入联合国教科文组织人类非物质文化遗产代表作名录。地方节庆、家庭饮食和农时知识仍在代际间流传。",
      "UNESCO inscribed the solar terms and their associated practices on its Representative List of the Intangible Cultural Heritage of Humanity. Communities continue to pass them on.",
    ],
  },
];

export const culture = [
  {
    title: ["田间的农时", "Time in the fields"],
    text: [
      "芒种前后，黄淮麦区赶晴收麦，江南稻区忙着插秧。同一个节气提醒人们留心田野，实际开工还得看品种、土壤和天气。",
      "Around Grain in Ear, farmers on the Yellow and Huai river plains harvest wheat while growers farther south transplant rice. Local crops, soil and weather set the working day.",
    ],
  },
  {
    title: ["餐桌上的时令", "A place at the table"],
    text: [
      "江南人家把春草的颜色揉进清明青团，苏州人在冬至用糯米团款待亲友。一道食物，记着当地的收成，也记着团聚的日子。",
      "Green Qingming cakes carry the colour of spring herbs. Suzhou’s solstice rice balls travel from house to house as gifts. Each food ties a local harvest to a shared occasion.",
    ],
  },
  {
    title: ["诗与四时", "Seasons in verse"],
    text: [
      "唐代杜甫在《小至》写下“天时人事日相催，冬至阳生春又来”。诗人从冬至后渐长的白昼里，望见下一季的春意。",
      "In his poem “Near the Winter Solstice,” Tang poet Du Fu sees the promise of spring in days that begin to lengthen even as winter deepens.",
    ],
  },
  {
    title: ["村落里的传承", "A living tradition"],
    text: [
      "在浙江衢州九华，人们以立春祭迎接春耕。在广西，壮族霜降节以聚会和歌舞联结村落。各地用自己的方式讲述同一轮四季。",
      "Jiuhua in Zhejiang welcomes the farming season with a spring rite. In Guangxi, the Zhuang Frost Descent Festival brings villages together through music and gatherings.",
    ],
  },
];

export const science = [
  {
    title: ["为什么会有四季？", "What gives us seasons?"],
    text: [
      "地轴相对轨道面的垂线倾斜约23.4°，一年里朝向几乎不变。地球公转时，倾向太阳的一侧半球在中高纬度白昼更长、阳光更直，另一侧正好相反。因此南北半球的冬夏相反。",
      "Earth’s axis tilts about 23.4° from the perpendicular to its orbit and keeps nearly the same direction through the year. As Earth orbits, a hemisphere leaning sunward gets longer days and more direct sunlight. Summer in one hemisphere is winter in the other.",
    ],
  },
  {
    title: ["节气为何有长有短？", "Why do terms vary in length?"],
    text: [
      "从地球看，太阳一年沿黄道走一圈。从春分点起量，走过的角度叫太阳黄经。每增加15°就交一个节气。地球在略呈椭圆的轨道上时快时慢，所以走完这15°大约要14.7至15.7天。",
      "Viewed from Earth, the Sun traces a yearly path called the ecliptic. Its angle along that path, measured from the March equinox, is solar longitude. Each 15° brings a new term. Earth travels at varying speeds along its slightly elliptical orbit, so a term lasts about 14.7 to 15.7 days.",
    ],
  },
  {
    title: ["为什么公历日期较稳定？", "Why do the dates stay close?"],
    text: [
      "一个四季循环约为365.2422天。公历用闰日调节，平均每年365.2425天，两者很接近。因此同一节气大致落在相同的公历日期附近，具体日期和时刻仍逐年变化。",
      "The seasonal year lasts about 365.2422 days. Leap days bring the Gregorian average to 365.2425 days. Because these lengths match so closely, a term returns near the same calendar date, though its exact time and date change.",
    ],
  },
];

// The shared character 暑 denotes both heat terms. UI term links should expose
// both choices. Small and major cold use 小 and 大 with a shared suffix 寒.
export const song = [
  [
    { char: "春", index: 0 },
    { char: "雨", index: 1 },
    { char: "惊", index: 2 },
    { char: "春", index: 3 },
    { char: "清", index: 4 },
    { char: "谷", index: 5 },
    { char: "天", index: null },
  ],
  [
    { char: "夏", index: 6 },
    { char: "满", index: 7 },
    { char: "芒", index: 8 },
    { char: "夏", index: 9 },
    { char: "暑", index: 10, indices: [10, 11] },
    { char: "相", index: null },
    { char: "连", index: null },
  ],
  [
    { char: "秋", index: 12 },
    { char: "处", index: 13 },
    { char: "露", index: 14 },
    { char: "秋", index: 15 },
    { char: "寒", index: 16 },
    { char: "霜降", index: 17 },
  ],
  [
    { char: "冬", index: 18 },
    { char: "雪", index: 19 },
    { char: "雪", index: 20 },
    { char: "冬", index: 21 },
    { char: "小", index: 22 },
    { char: "大", index: 23 },
    { char: "寒", index: null },
  ],
];

export const sources = [
  {
    title: [
      "香港天文台 · 二十四节气与太阳黄经",
      "Hong Kong Observatory · Solar terms and longitude",
    ],
    url: "https://www.hko.gov.hk/en/gts/time/24solarterms.htm",
  },
  {
    title: [
      "香港天文台 · 2022年历（第56–57页，节气与天文）",
      "Hong Kong Observatory · 2022 Almanac, solar terms and astronomy",
    ],
    url: "https://www.hko.gov.hk/en/gts/astron2022/files/HKO_almanac_2022.pdf",
  },
  {
    title: [
      "登封市人民政府 · 二十四节气的历史",
      "Dengfeng municipal government · History of the solar terms",
    ],
    url: "https://www.dengfeng.gov.cn/sjj/5237400.jhtml",
  },
  {
    title: [
      "联合国教科文组织 · 二十四节气",
      "UNESCO · The Twenty-Four Solar Terms",
    ],
    url: "https://ich.unesco.org/en/RL/the-twenty-four-solar-terms-knowledge-of-time-and-practices-developed-in-china-through-observation-of-the-suns-annual-motion-00647",
  },
  {
    title: [
      "中国非物质文化遗产网 · 二十四节气专题",
      "China Intangible Cultural Heritage · The solar terms",
    ],
    url: "https://www.ihchina.cn/solar_terms.html",
  },
  {
    title: ["NASA · 四季的成因", "NASA Space Place · What causes the seasons?"],
    url: "https://spaceplace.nasa.gov/seasons/en/",
  },
  {
    title: [
      "香港天文台 · 闰年与回归年",
      "Hong Kong Observatory · Leap years and the seasonal year",
    ],
    url: "https://www.hko.gov.hk/en/gts/time/basicterms-leapyear.htm",
  },
];
