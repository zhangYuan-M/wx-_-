/**
 * node 操作 MySQL 服务器
 */
// 生成随机数
const { nanoid } = require('nanoid')

const popularSpider = require('./crawler/popularCrawler') // 爬取热门电影数据
const previewSpider = require('./crawler/previewCrawler') // 爬取预告片电影数据
const sqlQuery = require('./mysql/mysql.js') // 自定义MySQL连接 执行 语句的模块
const { qiniu_host_url } = require('../config/index') // 七牛服务器的默认域名
const upload = require('./qiniu/upload.js') // 导出添加到七牛的方法

// 1、保存热门电影数据
async function handlePopularMovies() {
	const movieInfo = await popularSpider()
	console.log(movieInfo)
	// 1，创建数据表
	const creatTableSql = `CREATE TABLE IF NOT EXISTS  movieInfo(
    movieId  VARCHAR(100) NOT NULL,
    movieName VARCHAR(1000),
    director VARCHAR(1000),
    writer VARCHAR(1000),
    stars VARCHAR(1000),
    style VARCHAR(100),
    img VARCHAR(200),
    introduction VARCHAR(1000),
		href VARCHAR(1000),
		post_key VARCHAR(200),
    PRIMARY KEY (movieId)
  )ENGINE=InnoDB DEFAULT CHARSET=utf8;`
	await sqlQuery(creatTableSql)

	// 2. 向数据表添加数据
	const insertSql = `INSERT INTO movieInfo VALUES
  (?,?,?,?,?,?,?,?,?,?)`
	for (let i = 0; i < movieInfo.length; i++) {
		const val = movieInfo[i]
		const arr = [
			val.movieID,
			val.moveTitle,
			val.director,
			val.writer,
			val.stars,
			val.style,
			// 兼容性处理
			val.img.replace('.webp', '.jpg'),
			val.introduction,
			val.href,
			null
		]
		await sqlQuery(insertSql, arr)
	}
}

// 2、保存预告片电影数据
async function savaPreviewMovie() {
	const movieInfo = await previewSpider()
	// 1，创建数据表
	const creatTableSql = `CREATE TABLE IF NOT EXISTS  previewInfo(
		movieId VARCHAR(100) NOT NULL,
	  title  VARCHAR(100),
	  movieName VARCHAR(1000),
	  director VARCHAR(1000),
	  stars VARCHAR(2000),
	  styles VARCHAR(4000),
	  summary VARCHAR(1000),
	  releaseDate VARCHAR(2000),
		rating VARCHAR(1000),
		previewUrl VARCHAR(400),
		previewImg VARCHAR(500),
		link VARCHAR(400),
		_post_img_url VARCHAR(400),
	  PRIMARY KEY (movieId)
	)ENGINE=InnoDB DEFAULT CHARSET=utf8;`
	await sqlQuery(creatTableSql)

	// 2. 向数据表添加数据
	const insertSql = `INSERT INTO previewInfo VALUES
	(?,?,?,?,?,?,?,?,?,?,?,?,?)`
	for (let i = 0; i < movieInfo.length; i++) {
		const val = movieInfo[i]
		// 将数组重写为字符串
		movieInfo[i].stars = movieInfo[i].stars && movieInfo[i].stars.length ? movieInfo[i].stars.join(',') : '暂时没有数据'
		movieInfo[i].styles =
			movieInfo[i].styles && movieInfo[i].stars.length ? movieInfo[i].styles.join(',') : '暂时没有数据'
		movieInfo[i].releaseDate =
			movieInfo[i].releaseDate && movieInfo[i].stars.length ? movieInfo[i].releaseDate.join(',') : '暂时没有数据'
		const arr = [
			val.movieId,
			val.title,
			val.director,
			val.stars,
			val.styles,
			val.summary,
			val.releaseDate,
			val.durationTime,
			val.rating,
			val.previewUrl,
			val.previewImg,
			val.link,
			val.postImg
		]
		await sqlQuery(insertSql, arr)
	}
}

// 3、将数据库中豆瓣的预告片电影和图片数据上传到七牛中
async function saveData2qiniu() {
	// 1.创建数据表
	const createSql = `CREATE TABLE IF NOT EXISTS qiniu(
		movie_id  VARCHAR(10) NOT NULL,
		img_url VARCHAR(50),
		video_url VARCHAR(50),
		PRIMARY KEY (movie_id)
	)`
	await sqlQuery(createSql)

	// 2. 从 previewInfo表中获取要添加到七牛中的网络资源数据
	const selectSql = `SELECT movieId,previewImg,link,post_img_url FROM previewInfo WHERE link IS NOT NULL`
	const res1 = await sqlQuery(selectSql)

	// 3.循环遍历添加到七牛云服务器中
	for (let i = 0; i < res1.length; i++) {
		const val = res1[i]
		const { movieId, previewImg, link, post_img_url } = val
		console.log(movieId, previewImg, link)

		// 3.1. 处理图片数据
		// var key1 = nanoid(10) // 重命名网络资源名称
		// await upload(previewImg, 'wx2023526001', key1)
		// // 写入数据库中
		// const insertSql = `INSERT INTO qiniu VALUES('${movieId}', '${qiniu_img_url + key1}', NULL);`
		// await sqlQuery(insertSql)

		// 3.2. 处理视频数据
		// var key2 = nanoid(10) + '.mp4' // 重命名网络资源名称
		// await upload(link, 'wx2023526001', key2)
		// // 写入数据库中
		// const updateSql = `UPDATE qiniu SET video_url = '${qiniu_img_url + key2}' WHERE movie_id = '${movieId}'`
		// await sqlQuery(updateSql)

		// 3.3. 处理图片数据
		// var key1 = nanoid(10) + '.jpg' // 重命名网络资源名称
		// await upload(post_img_url, 'wx2023526001', key1)
		// // 写入数据库中
		// const updateSql = `UPDATE qiniu SET post_img_url = '${qiniu_img_url + key1}' WHERE movie_id
		// = '${movieId}'`
		// await sqlQuery(updateSql)
	}
}
