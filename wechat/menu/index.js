/*
  1、创建 修改 菜单
*/
// 自定义微信类
const WeChat = require('../wetChat.js')
// 自定义菜单的模板样式
const menu = require('./menuTemplate')

const w = new WeChat()

// 创建菜单, 先删除菜单，在创建菜单

w.deleteMenu().then(res => {
	// console.log(res.data)

	w.createMenu(menu).then(res1 => {
		// console.log(res1.data)
	})
})
