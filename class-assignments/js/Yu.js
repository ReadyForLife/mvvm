class Watcher {
    constructor(data, exp, fn) {
        this.data = data
        this.exp = exp
        this.fn = fn
    }

    update() {
        let val = this.data
        this.exp.trim().split('.').forEach(keyStr => {
            keyStr = keyStr.trim()
            val = val[keyStr]
        })
        this.fn(val)
    }
    
}

class MVVM {
    
    constructor(options) {
        this.el = options.el
        this.fragments = []
        this.Observe(options.data)
        this.data = options.data
        this.watchers = []
        this.Compile()
    }

    Compile() {
        const querySelector = document.querySelector(this.el)
        const fragments = document.createDocumentFragment()
        let child = querySelector.firstChild
        while (child = querySelector.firstChild) {
            fragments.appendChild(child)
        }
        this.replace(fragments)
        querySelector.appendChild(fragments)
    }

    replace(fragment) {
        fragment.childNodes.forEach(node => {
            const txt = node.textContent
            const reg = /\{\{(.*?)\}\}/g
            if ((node.nodeType === 3 || node.nodeType === 1) && reg.test(txt)) { // 替换"{{  }}"的文本
                let val = this.data
                RegExp.$1.split(".").forEach(keyStr => {
                    keyStr = keyStr.trim()
                    val = val[keyStr]
                })
                this.watchers.push(new Watcher(this.data, RegExp.$1,  (newVal) => {
                    node.textContent = txt.replace(reg, newVal).trim()
                }))
                node.textContent = txt.replace(reg, val).trim()
            }
            if (node.nodeType === 1) {
                const nodeAttr = node.attributes
                Array.from(nodeAttr).forEach(attr => {
                    const name = attr.name
                    const exp = attr.value
                    if (name.split('-')[0] === 'v') {
                        if (name === 'v-model') {
                            let preVal = this.data
                            let val = this.data
                            let key = exp.trim()
                            exp.split('.').forEach(keyStr => {
                                key = keyStr.trim()
                                preVal = val
                                val = val[key]
                            })
                            // 双向绑定
                            this.watchers.push(new Watcher(this.data, exp, (newVal) => {
                                node.value = newVal
                            }))
                            node.addEventListener('input', (e) => {
                                const newVal = e.target.value
                                preVal[key] = newVal
                            })
                            node.value = val
                        }
                    }
                })
            }
        })
    }

    Observe(data) {
        if (typeof data !== 'object') {
            return
        }
        for (const key in data) {
            let val = data[key]
            this.Observe(val)
            Reflect.defineProperty(data, key, { 
                 // 数据劫持
                configurable: true,
                get: () => {
                    return val
                },
                set: (newVal) => {
                    val = newVal
                    this.Observe(newVal)
                    this.notify()
                }
            })
        }
    }
    
    notify() { 
        // 发布订阅
        this.watchers.forEach(watcher => watcher.update())
    }
}

export { MVVM }