/***********************
 * @name JS
 * @author Jo.gel
 * @date 2019/1/17 0017
 ***********************/
import _ from 'lodash'
import './style.css'
import icon from './icon.png'
function component() {
	var element = document.createElement('div');
	
	// Lodash（目前通过一个 script 脚本引入）对于执行这一行是必需的
	element.innerHTML = _.join(['Hello', 'webpack','wwwwwwwwwww'], ' ');
	element.classList.add('hello')//??为什么这么做？
	
	var img = new Image()
	img.src=icon
	element.appendChild(img)
	return element;
}

document.body.appendChild(component());