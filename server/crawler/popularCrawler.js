/*
  1、热门电影爬虫
*/
const puppeteer = require('puppeteer')

// 热门电影 URL
const popularURL = `https://movie.douban.com/explore#!type=movie&tag=%E7%83%AD%E9%97%A8&sort=recommend&page_limit=20&page_start=0`

function timeout(timeout) {
	return new Promise(res => {
		// 普通写法
		// setTimeout(() => {
		// 	res()
		// }, timeout)
		// 高级写法
		setTimeout(res, timeout)
	})
}

// 暴露出去的方法
module.exports = async () => {
	// 1、打开浏览器
	const browser = await puppeteer.launch({
		// headless: false // 后台进行 运行浏览器
	})
	// 2、打开标签页
	const page = await browser.newPage()
	// 3、跳转指定网址
	await page.goto(popularURL, {
		waitUntil: 'networkidle2'
	})
	// 4、等待网址加载完毕，爬取数据
	// 可以开启延时器，延时指定时间爬取数据
	// await timeout(2000)
	// 4.1. 根据热门电影链接 爬取电影详情的具体链接
	const result = await page.evaluate(() => {
		// 对加载好的页面进行DOM操作
		//  return 就能将爬取的数据返回出去
		const $items = $('#wrapper .gaia .list-wp .list a')
		// 爬取完毕的数组
		let arr = []
		// 只获取八条数据
		for (let i = 0; i < 8; i++) {
			const href = $items[i].href
			const title = $($items[i])
				.find('p')
				.text()
				.replace(/[^\u4e00-\u9fa5]/gi, '')
			let obj = {
				href,
				title
			}
			arr.push(obj)
		}
		return arr
	})

	// 4.2. 根据电影详情的具体链接 爬取电影详情的数据
	const moveInfoArr = []
	for (let index = 0; index < result.length; index++) {
		const element = result[index]
		await page.goto(element.href, {
			waitUntil: 'networkidle2'
		})
		const obj = await page.evaluate(() => {
			// 对加载好的页面进行DOM操作
			// 爬取完毕的数组
			let obj = {
				movieID: $('meta:last')
					.prop('content')
					.match(/\d{5,}/)[0],
				moveTitle: $('#wrapper #content h1 span').text(),
				director: $('#info > span:first .attrs').text(),
				writer: $('#info > span:eq(1) .attrs').text(),
				stars: $('#info > span:eq(2) .attrs').text(),
				style: $('#info > span:eq(4)').text(),
				img: $('#mainpic a img').prop('src'),
				introduction: $('.related-info .indent span').text().trim()
			}
			return obj
		})
		obj['href'] = element.href
		moveInfoArr.push(obj)
	}

	// 5、关闭浏览器
	await browser.close()

	return moveInfoArr
}
