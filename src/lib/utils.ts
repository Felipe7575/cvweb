const languageMap: Record<string, string> = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ar": "Arabic",
    "hi": "Hindi",
    "nl": "Dutch",
    "tr": "Turkish",
    "pl": "Polish",
    "sv": "Swedish",
    "fi": "Finnish",
    "da": "Danish",
    "no": "Norwegian",
    "ko": "Korean",
    "he": "Hebrew",
    "el": "Greek",
    "cs": "Czech",
    "hu": "Hungarian"
};

export const getBrowserLanguage = (event) => {
    const acceptLanguage = event.request.headers.get('accept-language');
    if (!acceptLanguage) return "English"; // Valor predeterminado

    const langCode = acceptLanguage.split(',')[0].split('-')[0]; // Obtener código de idioma (ej: "es-ES" → "es")

    return languageMap[langCode] || "English"; // Devolver nombre o "English" por defecto
};
