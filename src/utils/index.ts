// const baseURL = "http://localhost:8088"
const baseURL = import.meta.env.VITE_API_URL


// 转换字符串，undefined,null等转化为""
export function praseStrEmpty(str: any) {
    if (!str || str == "undefined" || str == "null") {
        return "";
    }
    return str;
}

// 添加日期范围
export function addDateRange(params: any, dateRange: any, propName: any) {
    var search = params;
    search.params = {};
    if (null != dateRange && '' != dateRange) {
        if (typeof (propName) === "undefined") {
            search.params["beginTime"] = dateRange[0];
            search.params["endTime"] = dateRange[1];
        } else {
            search.params["begin" + propName] = dateRange[0];
            search.params["end" + propName] = dateRange[1];
        }
    }
    return search;
}


// 日期格式化
export function parseTime(time: any, pattern: string) {
    var datetime = new Date(time);
    if (arguments.length === 0 || !time) {
        return null
    }
    const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
        date = time
    } else {
        if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
            time = parseInt(time)
        } else if (typeof time === 'string') {
            time = time.replace(new RegExp(/-/gm), '/');
        }
        if ((typeof time === 'number') && (time.toString().length === 10)) {
            time = time * 1000
        }
        date = new Date(time)
    }
    const formatObj = {
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate(),
        h: date.getHours(),
        i: date.getMinutes(),
        s: date.getSeconds(),
        a: date.getDay()
    } as any;
    const time_str = format.replace(/{(y|m|d|h|i|s|a)+}/g, (result, key) => {
        let value = formatObj[key]
        // Note: getDay() returns 0 on Sunday
        if (key === 'a') {
            return ['日', '一', '二', '三', '四', '五', '六'][value]
        }
        if (result.length > 0 && value < 10) {
            value = '0' + value
        }
        return value || 0
    })
    return time_str
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(data: any, id: number, parentId: number, children: any) {
    let config = {
        id: id || 'id',
        parentId: parentId || 'parentId',
        childrenList: children || 'children'
    };

    const childrenListMap = {} as any;
    const nodeIds = {} as any;
    const tree = [];

    for (let d of data) {
        let parentId = d[config.parentId];
        if (childrenListMap[parentId] == null) {
            childrenListMap[parentId] = [];
        }
        nodeIds[d[config.id]] = d;
        childrenListMap[parentId].push(d);
    }

    for (let d of data) {
        let parentId = d[config.parentId];
        if (nodeIds[parentId] == null) {
            tree.push(d);
        }
    }

    for (let t of tree) {
        adaptToChildrenList(t);
    }

    function adaptToChildrenList(o: any) {
        if (childrenListMap[o[config.id]] !== null) {
            o[config.childrenList] = childrenListMap[o[config.id]];
        }
        if (o[config.childrenList]) {
            for (let c of o[config.childrenList]) {
                adaptToChildrenList(c);
            }
        }
    }

    return tree;
}

// 回显数据字典
export function selectDictLabel(datas: any, value: any) {
    var actions = [] as any;
    Object.keys(datas).some((key) => {
        if (datas[key].dictValue == ('' + value)) {
            actions.push(datas[key].dictLabel);
            return true;
        }
    })
    return actions.join('');
}


// 通用下载方法
export function download(fileName: any) {
    window.location.href = baseURL + "common/download?fileName=" + encodeURI(fileName) + "&delete=" + true;
}

// 通用导出方法（POST请求，用于接口导出Excel）
export function downloadByPost(url: string, params: any) {
    // 直接从 sessionStorage 取 token 并 JSON 解析（Session.set 用 JSON.stringify 存储）
    const rawToken = window.sessionStorage.getItem('token') || '';
    const token = rawToken ? JSON.parse(rawToken) : '';

    // 处理 baseURL 末尾斜杠，避免双斜杠
    const base = baseURL.replace(/\/$/, '');
    const fullUrl = url.startsWith('/') ? base + url : base + '/' + url;
    let queryStr = '';
    if (params) {
        const arr = [] as string[];
        for (const key in params) {
            if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
                arr.push(key + '=' + encodeURIComponent(params[key]));
            }
        }
        queryStr = arr.join('&');
    }

    const xhr = new XMLHttpRequest();
    xhr.open('POST', fullUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('AUTH-TOKEN', token);
    xhr.responseType = 'blob';
    xhr.onload = function () {
        // 检查是否真的是文件流（通过 Content-Type 判断）
        const contentType = xhr.getResponseHeader('content-type') || '';
        if (xhr.status === 200 && contentType.includes('application/vnd')) {
            const blob = xhr.response;
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            const contentDisposition = xhr.getResponseHeader('content-disposition');
            let fileName = 'export.xlsx';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"']+)["']?/i);
                if (match) fileName = decodeURIComponent(match[1]);
            }
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } else if (xhr.status === 401 || xhr.status === 403) {
            console.error('[downloadByPost] 认证失败或无权限，状态码:', xhr.status);
            alert('导出失败：' + xhr.status + ' - 请检查登录状态或权限');
        } else {
            console.error('[downloadByPost] 导出异常，状态码:', xhr.status, contentType);
            // 尝试读取错误信息
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    const err = JSON.parse(reader.result as string);
                    alert('导出失败: ' + (err.msg || '未知错误'));
                } catch(e) {
                    alert('导出失败: 状态码 ' + xhr.status);
                }
            };
            reader.readAsText(xhr.response);
        }
    };
    xhr.send(queryStr);
}
