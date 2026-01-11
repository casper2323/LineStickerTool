
// Prompt Data Configurations
// 定義 Prompt 生成所需的資料配置

export const PROMPT_THEMES = {
    daily: {
        label: '日常用語 (Daily Use)',
        texts: '早安、晚安、謝謝、不客氣、對不起、沒問題、好的、收到、拜託、辛苦了、OK、等等',
        emotions: '喜、怒、哀、樂、驚訝、無語、放空、大哭 (Happy, Angry, Sad, Joy, Surprised, Speechless, Blank, Crying)',
        actions: '謝謝配雙手合十、OK比手勢、早安揮手、發呆流口水 (Thanks with folded hands, OK gesture, Waving good morning, Drooling while spacing out)'
    },
    greet: {
        label: '打招呼 (Greeting)',
        texts: 'Hello、Hi、早安、午安、晚安、你好、吃飽沒、好久不見、初次見面、歡迎、有空嗎、掰掰',
        emotions: '熱情、微笑、眨眼、期待、害羞、友善 (Enthusiastic, Smiling, Winking, Expectant, Shy, Friendly)',
        actions: '揮手致意、90度鞠躬、從角落探頭、比手指愛心、拿著大聲公 (Waving, Bowing 90 degrees, Peeking from corner, Finger heart, Holding megaphone)'
    },
    holiday: {
        label: '節日祝福 (Holiday)',
        texts: '新年快樂、恭喜發財、生日快樂、聖誕快樂、情人節快樂、中秋快樂、母親節快樂、父親節快樂、端午安康、萬聖節快樂、Happy New Year、紅包拿來',
        emotions: '喜氣洋洋、興奮、溫馨、大笑、感動、派對臉 (Festive, Excited, Warm, Laughing, Touched, Party face)',
        actions: '雙手拿紅包、點燃鞭炮、捧著生日蛋糕、送出禮物盒、舉杯慶祝 (Holding red envelope, Lighting firecrackers, Holding birthday cake, Giving gift box, Toasting)'
    },
    response: {
        label: '回應篇 (Response)',
        texts: '真的假的、笑死、確?、好喔、??、!!!、無言、傻眼、厲害、佩服、+1、路過',
        emotions: '震驚到變形、翻白眼、懷疑眼神、豎起大拇指、敷衍假笑 (Shocked distortion, Rolling eyes, Suspicious look, Thumbs up, Perfunctory smile)',
        actions: '比讚、雙手打叉(NG)、單手扶額頭、吃瓜看戲、比出 OK 手勢 (Thumbs up, Crossing arms (NG), Facepalm, Eating popcorn watching drama, OK gesture)'
    },
    work: {
        label: '上班族 (Office Worker)',
        texts: '收到、馬上改、開會中、加班、準時下班、心累、報告長官、辛苦了、求放過、薪水呢、不想上班、加油',
        emotions: '眼神死、崩潰大哭、職業假笑、黑眼圈深重、燃燒鬥志 (Dead eyes, Breakdown crying, Professional fake smile, Heavy dark circles, Burning fighting spirit)',
        actions: '瘋狂敲鍵盤、吊點滴喝咖啡、趴在桌上靈魂出竅、標準敬禮、舉白旗投降 (Typing furiously, IV drip coffee, Soul leaving body on desk, Standard salute, Surrendering)'
    },
    couple: {
        label: '老公老婆 (Couple)',
        texts: '愛你、想你、抱抱、親親、寶貝、老公、老婆、在幹嘛、快回家、買給我、原諒我、啾咪',
        emotions: '害羞臉紅、色瞇瞇、撒嬌水汪汪大眼、生氣鼓臉、陶醉 (Blushing, Lustful, Puppy eyes, Pouting angry, Intoxicated)',
        actions: '抱緊處理、發射飛吻、跪算盤謝罪、摸頭殺、壁咚 (Tight hug, Blowing kiss, Kneeling on abacus, Head pat, Kabedon)'
    },
    meme: {
        label: '迷因搞笑 (Meme)',
        texts: '是在哈囉、我就爛、阿姨我不想努力了、像極了愛情、可憐哪、嚇到吃手手、沒在怕、本斥但大、真香、歸剛欸、突破盲腸、怕',
        emotions: '極度嘲諷臉、堅定眼神、猥瑣笑容、崩壞顏藝、鄙視眼神 (Extreme mocking face, Firm look, Wretched smile, Broken face, Despising look)',
        actions: '攤手無奈、指指點點、戴墨鏡耍帥、拿著鹹魚攻擊、謎之舞步 (Shrugging helplessly, Pointing, Wearing sunglasses, Attacking with salted fish, Mysterious dance step)'
    }
};

export const PROMPT_STYLES = {
    qversion: { label: '通用 Q 版 (Q-Version)', desc: '可愛、活潑、2D平面 (Cute, Lively, 2D Flat)' },
    realistic: { label: '寫實風格 (Realistic)', desc: '細緻、擬真、高質感 (Detailed, Realistic, High Quality)' },
    threed: { label: '3D 立體 (3D)', desc: 'Blender風格、圓潤、光影 (Blender Style, Rounded, Lighting)' },
    sketch: { label: '手繪塗鴉 (Sketch)', desc: '線條感、童趣、蠟筆 (Line work, Childlike, Crayon)' },
    pixel: { label: '像素風 (Pixel Art)', desc: '復古遊戲、8-bit (Retro Game, 8-bit)' },
    anime: { label: '日系動漫 (Anime)', desc: '大眼、賽璐璐上色 (Big eyes, Cel shading)' }
};
