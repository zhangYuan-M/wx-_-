/*
  1、预告片电影爬取
*/

const puppeteer = require('puppeteer')

// 即将上映电影 URL
const previewUrl = `https://movie.douban.com/coming?sequence=asc`

// 延时器
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
		timeout: 0,
		headless: false // 后台进行 运行浏览器
	})
	// 2、打开标签页
	const page = await browser.newPage()
	// 3、跳转指定网址
	await page.goto(previewUrl, {
		waitUntil: 'networkidle2'
	})
	// 4、等待网址加载完毕，爬取数据
	// 可以开启延时器，延时指定时间爬取数据  // await timeout(2000)
	// 4.1. 即将上映电影链接 爬取电影详情的具体链接
	const result = await page.evaluate(() => {
		// 对加载好的页面进行DOM操作
		//  return 就能将爬取的数据返回出去
		const allTr = $('#content .grid-16-8 table tbody tr')
		// 爬取完毕的数组
		let arr = []
		for (let i = 0; i < allTr.length; i++) {
			console.log(i)
			let num = $(allTr[i]).find('td').last().text()
			// 获取想看的人数
			num = parseInt(num)
			if (num > 20) {
				// 获取电影详情页面的地址
				let href = $(allTr[i]).find('a').attr('href')
				arr.push(href)
			}
		}
		return arr
	})

	// 4.2. 根据电影详情的具体链接 爬取电影详情的数据
	const moveInfoArr = []
	let length = result.length // 爬取预告片的长度
	for (let index = 0; index < length; index++) {
		const href = result[index]
		// 根据每个链接跳转指定的页面
		await page.goto(href, {
			waitUntil: 'networkidle2'
		})
		// 获取每一个电影的具体信息
		let movieResult = await page.evaluate(() => {
			// 电影ID
			let movieId = $('meta:last')
				.prop('content')
				.match(/\d{5,}/)[0]
			// 电影名称
			let title = $('[property="v:itemreviewed"]').html()
			// 导演
			let director = $('[rel="v:directedBy"]').html()
			// 明星 数组
			let stars = []
			let array = $('[rel="v:starring"]')
			for (let i = 0; i < array.length; i++) {
				const element = array[i].innerText
				stars.push(element)
			}
			// 电影类型 数组
			let styles = []
			let array1 = $('[property="v:genre"]')
			for (let i = 0; i < array1.length; i++) {
				const element = array1[i].innerText
				styles.push(element)
			}
			// 电影简介
			let summary = $('[property="v:summary"]').html().trim()
			// 上映日期
			let releaseDate = []
			let array2 = $('[property="v:initialReleaseDate"]')
			for (let i = 0; i < array2.length; i++) {
				const element = array2[i].innerText
				releaseDate.push(element)
			}
			console.log(releaseDate)
			// 片长
			let durationTime = $('[property="v:runtime"]').html()
			// 评分
			let rating = $('[property="v:average"]').html()
			// 预告片电影的网址
			let previewUrl = ($('[class="related-pic-video"]')[0] && $('[class="related-pic-video"]')[0].href) || '暂无预告片'
			// 预告片电影的封面图片
			let previewImg =
				($('.related-pic-video')[0] &&
					$($('.related-pic-video')[0]).css('background-image').match('".*?"')[0].replace(/\"/g, '')) ||
				'暂无预告片'
			// 电影海报图片
			let postImg = $('[id="mainpic"] a img').attr('src').replace('.webp', '.jpg')
			return {
				movieId,
				title,
				director,
				stars,
				styles,
				summary,
				releaseDate,
				durationTime,
				rating,
				previewUrl,
				previewImg,
				postImg
			}
		})
		// 追加数据
		moveInfoArr.push(movieResult)
	}

	// 4.3. 爬取预告片电影的电影链接
	for (let i = 0; i < moveInfoArr.length; i++) {
		let item = moveInfoArr[i]
		// 兼容性处理
		if (item.previewUrl === '暂无预告片') {
			continue
		}
		let url = item.previewUrl
		//跳转到电影预告片详情页
		await page.goto(url, {
			waitUntil: 'networkidle2' //等待网络空闲时，在跳转加载页面
		})
		//爬取其他数据
		item.link = await page.evaluate(() => {
			//电影链接
			let link = $('video>source').attr('src')
			return link
		})
	}

	// 5、关闭浏览器
	await browser.close()

	return moveInfoArr
}
