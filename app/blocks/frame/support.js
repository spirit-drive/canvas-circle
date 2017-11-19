// Функции для помощи. Решил не использовать данную нанобиблиотеку
let support = {

    // Ограничивает значение в заданом диапазоне и возвращает значение
    limiter: function (value,min,max) {
        return (value > max) ? max
            : (value < min) ? min
                : value;
    },

    // Целочисленный рандом
    randomInt: function(min, max){
        return Math.round(Math.random() * (max - min)) + min;
    },

    // Дистанция между двумя точками
    distance: function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
};
