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
先粘点代码，为了将 state 转换为 props，需要在最外层的组件外封装一层Provider，所以 redux 里面你需要这样写


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
	  	// Provider 接收一个 props 为 store
	  	// Provider 的 children 必须为一个 function，因为 Provider 内部会执行 this.props.children()
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



