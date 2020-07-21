const mysql = require('mysql')

// MySQL 连接配置项
let options = {
	host: 'localhost',
	user: 'root',
	password: '123456',
	database: 'Node_MySQL'
}

// 创建连接对象
let con = mysql.createConnection(options)

// 连接数据库
con.connect(err => {
	if (err) {
		return console.log('连接数据库失败')
	}
	console.log('连接数据库成功！ Success Connet MySQL')
})

// 运行sql语句函数
/**
 * @param string sqlStr 数据库查询语句 ，如果有参数可以使用 ? 占位
 * @param array sqlParamArr 如果有参数可以将 占位的数据 放进数组中
 * @returns 如果成功返回查询数据，如果失败返回错误信息
 */
function sqlQuery(sqlStr, sqlParamArr) {
	return new Promise((resolve, reject) => {
		con.query(sqlStr, sqlParamArr, (err, result) => {
			if (err) {
				reject(err.message)
			}
			resolve(result)
		})
	})
}

module.exports = sqlQuery
