var reducers = {
    a: function(state, action) {
        return state;
    },
    b: function(state, action) {
        return state;
    },
    c: function(state, action) {
        return state;
    },
    d: function(state, action) {
        return state;
    },
};
var fn = (reducer, key) => {
var newState = reducer(1, 2);
return newState;
};

var result = Object.keys(reducers).reduce((result, key) => {
console.log(result);
console.log(key);
result[key] = fn(reducers[key], key);
return result;
}, {});

console.log(result);