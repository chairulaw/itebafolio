const badWords = [
    "dongo", "bodoh", "tolol", "anjing", "babi", "bangsat",
    "bajingan", "sampah", "goblok", "idiot", "brengsek",
    "kampret", "kontol", "memek", "pepek", "perek", "puki",
    "titit", "jembut", "banci"
];

export const checkProfanity = (text) => {
    if (!text || typeof text !== 'string') {
        return { isViolating: false, matchedWords: [], censoredText: text };
    }

    let censoredText = text;
    const matchedWords = [];

    badWords.forEach((word) => {
        // Gunakan 'gi' (Global & Case-Insensitive) agar mengecek seluruh kalimat
        const regex = new RegExp(word, 'gi'); 
        
        if (regex.test(censoredText)) {
            matchedWords.push(word);
            // Ganti kata kasar dengan tanda bintang sesuai jumlah hurufnya
            censoredText = censoredText.replace(regex, '*'.repeat(word.length));
        }
    });

    return {
        isViolating: matchedWords.length > 0,
        // Hapus duplikat kata jika user mengetik kata yang sama berulang kali
        matchedWords: [...new Set(matchedWords)], 
        censoredText: censoredText
    };
};