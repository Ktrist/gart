const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ne modifier les extensions que pour le web
// Sur iOS/Android, garder l'ordre par défaut
module.exports = config;
