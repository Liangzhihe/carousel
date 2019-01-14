// 剩下一个比较严重的问题，为什么切换浏览器标签页，会导致计时器有瞬时的混乱，如何解决？

class Carousel {
    constructor(obj) {
        this.imgUrl = obj.imgUrl;
        this.id = obj.id;
        this.num = 0;
        this.timer = {};
    }

    init() {
        const domObj = this.addHtml();
        const basic = this.basicCarousel(domObj);
        this.registerEvent(basic, domObj);
    }

    /**
     * 添加轮播图html
     *
     * @returns
     * @memberof Carousel
     */
    addHtml(){
        const wrap = document.getElementById(this.id);
        wrap.classList.add('carousel-wrap');
        const width = wrap.clientWidth;
        const inner = this.addInner(wrap,width);
        const tab = this.addTab(wrap,width);
        const prevNext = this.addPrevNext(wrap,width);
        return {width, inner, tab, prevNext, wrap};
    }

    /**
     * 添加轮播图内部图片展示区域
     *
     * @param {*} wrap 容器
     * @param {*} width 容器宽度
     * @memberof Carousel
     */
    addInner(wrap, width){
        const imgList = this.imgUrl;
        const len = imgList.length;
        if (len === 0) {
            console.error('至少需要一张图片');
        }
        const inner = document.createElement('ul');
        inner.setAttribute('id', 'carousel-inner');
        inner.style.width = `${width*(len + 2)}px`;
        inner.style.marginLeft = `-${width}px`;
        // 在按顺序添加图片的同时，为实现无缝轮播，在inner最前部添加List中最后一张图片，在inner末尾添加List中首张图片
        inner.appendChild(this.addInnerImg(width, imgList, len-1));
        for (let i = 0; i < len; i++) {
            inner.appendChild(this.addInnerImg(width, imgList, i));
        }
        inner.appendChild(this.addInnerImg(width, imgList, 0));
        wrap.appendChild(inner);
        return inner;
    }

    /**
     * 添加图片
     *
     * @param {*} width
     * @param {*} imgList
     * @param {*} i
     * @returns
     * @memberof Carousel
     */
    addInnerImg(width, imgList,i) {
        const t = document.createElement('li');
        t.style.width = `${width}px`;
        const img = document.createElement('img');
        img.setAttribute('src', imgList[i]);
        img.setAttribute('alt', i);
        t.appendChild(img);
        return t;
    }

    addTab(wrap){
        const len = this.imgUrl.length;
        const tab = document.createElement('div');
        tab.setAttribute('id', 'carousel-tab');
        for (let i = 0; i < len; i++) {
            const tabItem = document.createElement('span');
            tab.appendChild(tabItem);
        }
        tab.querySelector('span').classList.add('on');
        wrap.appendChild(tab);
        return tab;
    }

    addPrevNext(wrap){
       const prev = document.createElement('div');
       prev.setAttribute('id','carousel-prev');
       prev.innerHTML = '&lt;';
       const next = document.createElement('div');
       next.setAttribute('id','carousel-next');
       next.innerHTML = '&gt;';
       wrap.appendChild(prev);
       wrap.appendChild(next);
       return {prev,next};
    }

    /**
     * 初始化定时器
     *
     * @param {*} domObj
     * @returns
     * @memberof Carousel
     */
    basicCarousel(domObj){
        const that = this;
        const len = this.imgUrl.length;
        const { inner, tab, width } = domObj;
        // console.log(inner);
        const basic = setInterval(this.basicFunc, 2000, {len,inner,tab,width,that});
        return basic;
    }

    basicFunc(obj) {
        const { len, that } = obj;
        if (that.num < len-1) {
            that.num++;
        } else {
            that.num = 0;
        }
        that.basicCarouselPic(obj);
    }

    basicCarouselPic(obj) {
        const { inner, tab, width } = obj;
        const num = this.num;
        let j = 1;
        const timerBasic = setInterval(() => {
            if (j <= 50) {
                inner.style.marginLeft = (-width) * num + (-(width/50) * j) + 'px';
                j++;
            } else {
                clearInterval(timerBasic);
            }
        }, 10);
    
        const tabList = tab.querySelectorAll('span');
        tabList.forEach(item => {
            item.classList.remove('on');
        });
        tabList[num].classList.add('on');
    }

    /**
     * 注册各类事件
     *
     * @param {*} basic
     * @param {*} domObj
     * @memberof Carousel
     */
    registerEvent(basic, domObj){
        console.log(basic);
        this.wrapEvent(basic, domObj);
        this.tabListEvent(domObj);
        this.prevNextEvent(domObj);
    }

    /**
     * 添加mouseover事件，当鼠标滑入轮播图时，停止基础定时器，滑出时，恢复定时器；
     *
     * @param {*} basic
     * @param {*} domObj
     * @memberof Carousel
     */
    wrapEvent(basic, domObj){
        const that = this;
        const len = this.imgUrl.length;
        const { wrap, prevNext:{ prev, next }, inner, tab, width } = domObj
        wrap.addEventListener('mouseover', function() {
            prev.style.display = 'block';
            next.style.display = 'block';
            clearInterval(basic);
        });

        wrap.addEventListener('mouseout', function() {
            prev.style.display = 'none';
            next.style.display = 'none';
            basic = setInterval(that.basicFunc, 2000, {len,inner,tab,width,that});
        });
    }

    tabListEvent(domObj){
        const that = this;
        const { tab } = domObj;
        const tabList = tab.querySelectorAll('span');
        tabList.forEach((item, index) => {
            item.addEventListener('click', function (e) {
                console.log(e.target, index);
                that.moveToPic({index, tabList, domObj});
                that.num = index;
            });
        });
    }

    prevNextEvent(domObj){
        const that = this;
        const { tab, prevNext: {prev, next} } = domObj;
        const tabList = tab.querySelectorAll('span');
        const len = this.imgUrl.length;

        prev.addEventListener('click', function () {
            const active = that.returnActive(tabList);
            that.move({diff: -1, active, tabList, domObj});
            if (that.num === 0) {//边际条件
                that.num = len-1;
            } else {
                that.num -= 1;
            }
        });

        next.addEventListener('click', function () {
            const active = that.returnActive(tabList);
            that.move({diff: 1, active, tabList, domObj});
            if(that.num === len-1) {
                that.num = 0;
            } else {
                that.num += 1;
            }
        });
    }

    moveToPic(obj){
        const { index, tabList, domObj } = obj;
        const active = this.returnActive(tabList);
        const diff = index - active;
        this.move({diff, active, tabList, domObj});
    }

    move(obj) {
        // console.log(obj);
        let { diff, active, tabList, domObj } = obj;

        const { inner, width } = domObj;
        const index = diff + active;
        if (index < 0) {
            // 此段用于处理prev及next逻辑边际条件
            active = tabList.length;
        } else if (index >= tabList.length) {
            active = -1;
        }

        const absDiff = Math.abs(diff);
        let symbol = -1;
        if (diff < 0) {
            symbol = 1;
        }
        let i = 0;
        clearInterval(this.timer);// 清除重复定时器，防止点续点击下出现画面抖动
        const timer = setInterval(() => {
            if (i <= 50*absDiff) {
                inner.style.marginLeft = (-width) * (active+1) + (symbol*(width/50) * i) + 'px';
                i++;
            } else {
                clearInterval(timer);
            }
        }, 10/absDiff);

        this.timer = timer;
        tabList.forEach(item => {
            item.classList.remove('on');
        });

        const realIndex = diff + active; //此处index是active赋值后再次计算得出的
        tabList[realIndex].classList.add('on');

    }

    /**
     * 返回当前轮播图所显示图片的index
     *
     * @param {*} tabList
     * @returns {number} active 
     * @memberof Carousel
     */
    returnActive(tabList) {
        let active = 0;
        tabList.forEach((item, index) => {
            if (item.classList.contains('on')) {
                active = index;
            }
        });
        return active;
    }
}
