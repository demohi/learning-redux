# learning-redux

梳理 redux 背后原理，具体 redux 的使用请访问[redux](https://github.com/gaearon/redux)

就是一个流水账记录

## redux

redux 是一个 Flux 架构的实现，相比其他 Flux 框架，它又很多很酷的功能

- 整个项目所有的代码都是可以 hot-reload，并且不丢失 state，这对于开发复杂的单页应用非常有帮助
- 基于大量 es6+ 特性开发
- 其他待加，上面的特点是我目前对redux最感兴趣的地方，其他功能并没有独有性

### redux 是如何实现 hot-reload 的？

* webpack 提供的[Hot Module Replacemen](http://webpack.github.io/docs/hot-module-replacement.html)
* redux 作者开发的[React Hot Loader](http://gaearon.github.io/react-hot-loader/)
* redux 将数据全部转换为 props，这样可以保证项目整体可以 hot-reload


### redux 代码整理

#### Provider

Provider 是用来接收整个应用 Store 的组件，这一层的封装主要是为了支持 hot-reload

Provider 将 this.state.store 绑定到了 context，是的下层的 connector 得以改变全局 state

```javascript
	import { createStore, combineReducers } from 'redux';
	/** 
	 * redux 1.0后，与组件相关的代码被迁移到 react-redux
	 * Provider 是一个redux 提供的组件，用来接收 store
	 */ 
	import { Provider } from 'react-redux';
	//构造 reducer&store
	const reducer = combineReducers(reducers);
	const store = createStore(reducer);

	export default class App extends Component {
	  render() {
	  	/** Provider 接收一个 props 为 store
	  	 * Provider 的 children 必须为一个 function，
	  	 * 因为 Provider 内部会执行 this.props.children()
	  	 */
	    return (	
	      <Provider store={store}>
	        {() => <TodoApp /> }
	      </Provider>
	    );
	  }
	}
```

redux 为了方便开发，使用了decorator，来简化开发，上面的代码可以简化成


```javascript
	import { createStore, combineReducers } from 'redux';
	import { provide } from 'react-redux';
	const reducer = combineReducers(reducers);
	const store = createStore(reducer);
	
	@provide(store);
	export default class App extends Component {
	  render() {
	    return (	
	        {() => <TodoApp /> }
	    );
	  }
	}
```

#### Reducer

reducers 可以理解为一堆 fn(state, action) 的函数，例如

```javascript
//传入 state 和 action，返回新的 state
export default function todos(state = initialState, action) {
  switch (action.type) {
  case ADD_TODO:
    return [{
      id: (state.length === 0) ? 0 : state[0].id + 1,
      marked: false,
      text: action.text
    }, ...state];
  	break;
  }
}  	  
```

那么 reducer 怎么被使用呢？

```javascript
    // 把多个 reducers 合并成一个 reducer
	const reducer = combineReducers(reducers);
	const store = createStore(reducer);
```

combineReducers的源码如下(简化版)

```javascript
export default function combineReducers(reducers) {
  // 容错代码  pick 主要是把非 function 的 reducer 删除
  var finalReducers = pick(reducers, (val) => typeof val === 'function');
  // combineReducers最后返回的是一个函数，接收 steate 和 action
  // 看明白了吧，这个函数就是为了把多个 reducers 合并成一个 reducer
  return function combination(state = {}, action) {
    return mapValues(finalReducers, (reducer, key) => {
      //state 会根据 key 来区分
      var newState = reducer(state[key], action);
      return newState;
    });
  };
}
```

#### Store

store 会存储当前的 state、另外可以调用 action 和监听变化


#### Connector



```javascript
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { Connector } from 'react-redux';
import Header from '../components/Header';
import MainSection from '../components/MainSection';
import * as TodoActions from '../actions/TodoActions';

export default class TodoApp extends Component {
  render() {
    return (
      <Connector select={state => ({ todos: state.todos })}>
        {this.renderChild}
      </Connector>
    );
  }
  renderChild({ todos, dispatch }) {
    const actions = bindActionCreators(TodoActions, dispatch);
    return (
      <div>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
      </div>
    );
  }
}
```


对于 redux 应用来说，store 和 redux(通过合并成一个) 都只有一个，connector 的作用有两个

* 将 store 的一部分数据，和组件进行绑定
* 将 action 和数据进行单向绑定   action-->state->view


connector 需要传入一个 select 的 props，select 是个函数，参数为 state

state 是当前应用的 state，当前应用的 state 是通过Provider的 this.context.state 传下来的


同样 connector 也有 Decorator 的简化版

```javascript
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from '../components/Header';
import MainSection from '../components/MainSection';
import * as TodoActions from '../actions/TodoActions';
@connect({state => ({ todos: state.todos })})
export default class TodoApp extends Component {
  render({ todos, dispatch }) {
  	// actions 
    const actions = bindActionCreators(TodoActions, dispatch);
    return (
      <div>
        <Header addTodo={actions.addTodo} />
        <MainSection todos={todos} actions={actions} />
      </div>
    );
  }
}
```

#### action


action最简单可以返回一个包含 action type 的对象，redux 会对 action 进行封装

同样借助 middleware，你也可以返回 thunk、promise等数据类型

```
export function addTodo(text) {
  return {
    type: types.ADD_TODO,
    text
  };
}

// Can also be async if you return a function
// by middleware  redux-thunk
export function incrementAsync() {
  return dispatch => {
    setTimeout(() => {
      // Yay! Can invoke sync or async actions with `dispatch`
      dispatch(increment());
    }, 1000);
  };
}


// Could also read state of a store in the callback form
export function incrementIfOdd() {
  return (dispatch, getState) => {
    const { counter } = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}



```




