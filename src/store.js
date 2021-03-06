/**
 * Vuex
 * http://vuex.vuejs.org/zh-cn/intro.html
 */
import Vue from 'vue';
import Vuex from 'vuex';
import common from './common.js'

Vue.use(Vuex);

const now = new Date();
const store = new Vuex.Store({
    state: {// 相当于数据库
        // 当前用户
        user: {
            name: '苹果',
            department: "橙工厂市场部",
            img: 'dist/images/apple.jpg'
        },
        // 会话列表
        sessions: [
            {
                id: 1,
                user: {
                    name: '猫咪',
                    department: "龙湖天街",
                    img: 'dist/images/cat.jpg',
                    project: "河马先生"
                },
                unRead: false,
                count: "",
                messages: [
                    {
                        content: 'Hello',
                        date: now,
                        isShow: true
                    }, {
                        content: '干啥呢',
                        date: now,
                        isShow: false
                    }
                ]
            },
            {
                id: 2,
                user: {
                    name: '女孩',
                    department: "蓝色港湾",
                    img: 'dist/images/girl.jpg',
                    project: "天猫超市"
                },
                unRead: false,
                count: "",
                messages: [
                    {
                        content: '咋样是',
                        date: now,
                        isShow: true
                    }
                ]
            },
            {
                id: 3,
                user: {
                    name: '财神',
                    department: "朝阳大悦城",
                    img: 'dist/images/moneyFather.jpg',
                    project: "百度外卖",

                },
                unRead: false,
                count: "",
                messages: []
            }
        ],
        // 当前选中的会话
        currentSessionId: 1,
        // 过滤出只包含这个key的会话
        filterKey: '',
    },
    mutations: {// 修改数据
        INIT_DATA(state) {// 初始化数据

            var datas = JSON.parse(localStorage.getItem('vue-chat-user'));
            if (datas) {
                for (var i = 0; i < datas.length; i++) {

                    var currentId = datas[i].id
                    var itemMessage = JSON.parse(localStorage.getItem(currentId + '-id-content'));
                    datas[i].messages = itemMessage

                }
                let data = JSON.stringify(datas)  
                state.sessions = JSON.parse(data);
                state.currentSessionId=JSON.parse(localStorage.getItem("currentId"))

            }
        },

        // 发送消息
        SEND_MESSAGE({ sessions, currentSessionId }, content) {
            let session = sessions.find(item => item.id === currentSessionId);
            var isShow = true;
            let localMessage = JSON.parse(localStorage.getItem("vue-chat-user"));//本地缓存数据
            // let curList = sessions[0];// 最上面的也就是我要发送消息的
            if (localMessage) {
                for (var i = 0; i < localMessage.length; i++) {
                    if (localMessage[i].id == currentSessionId) {

                        let currentMes = JSON.parse(localStorage.getItem(currentSessionId + "-id-content"))

                        let precurrentDate;
                        if (currentMes.length <= 0) {
                            precurrentDate = 0
                        } else {
                            precurrentDate = currentMes[currentMes.length - 1].date
                        }
                        if (new Date() - new Date(precurrentDate) < 60000) {//时间差小于1分
                            // 最后一条数据的isShow=false
                            isShow = false;
                        }
                    }
                }
            }
            if (content.replace(/(^\s*)|(\s*$)/g, "") != "") {
                session.messages.push({
                    content: content,
                    date: new Date(),
                    self: true,
                    isShow: isShow,
                });
            }
        },
        // 选择会话
        SELECT_SESSION(state, id) {
            state.currentSessionId = id;
            let session = state.sessions.find(item => item.id == id);
            session.unRead = false
            session.count = "";
            // localStorage.setItem("currentSessionId",JSON.stringify(id))
        },
        // 搜索
        SET_FILTER_KEY(state, value) {
            state.filterKey = value;
        },
        // 修改session里面的数据排序
        CHANGE_LIST(state, id) {
            const curSession = state.sessions;// 
            var index;
            for (var i = 0; i < curSession.length; i++) {
                if (curSession[i].id == id) {
                    index = i;
                }
            }
            var currentList = state.sessions[index]
            state.sessions.remove(currentList);
            state.sessions.unshift(currentList);

        },
        // 接受新消息
        NEW_INFO({ sessions, currentSessionId }, id) {
            let session = sessions.find(item => item.id == id);//当前的会话信息
            let isShow = true;//时间显示
            let localMessage = JSON.parse(localStorage.getItem("vue-chat-user"));//本地缓存数据的
            if (localMessage) {
                for (var i = 0; i < localMessage.length; i++) {
                    if (localMessage[i].id == id) {
                        let currentMes = JSON.parse(localStorage.getItem(currentSessionId + "-id-content"))
                        console.log(currentMes)
                        let precurrentDate;
                        if(currentMes){
                            if (currentMes.length <= 0) {
                                precurrentDate = 0
                            } else {
                                precurrentDate = currentMes[currentMes.length - 1].date
                            }
                            if (new Date() - new Date(precurrentDate) < 60000) {//时间差小于1分
                                // 最后一条数据的isShow=false
                                isShow = false;
                            }
                        }else{
                            precurrentDate = 0
                        }
                        
                       
                    }
                }
            }



            session.messages.push({
                content: "你好，大家好！",
                date: new Date(),
                self: false,
                isShow: isShow,
            });

            if (currentSessionId != id) {//不是当前页就会显示未读
                //没有未读 打开页在当前页
                session.unRead = true
            }
            // 未读消息置顶
            var index;
            for (var i = 0; i < sessions.length; i++) {
                if (sessions[i].id == id) {
                    index = i;
                }
            }
            var currentList = sessions[index]
            sessions.remove(currentList);
            sessions.unshift(currentList);
        },
        //改变添加的数据条数
        ADD_NUM({ sessions, currentSessionId }, id) {
            let session = sessions.find(item => item.id == id);//当前的会话信息
            if (currentSessionId != id) {
                if (session.count) {
                    session.count += 1;
                } else {
                    session.count = 1;
                }
            }
        },
        REMOVE_NUM({ sessions }, id) {
            let session = sessions.find(item => item.id == id);//当前的会话信息
            session.count = "";
        },
    }
});
store.watch(
    (state) => state,
    (val) => {
        var currentId=val.currentSessionId
        localStorage.setItem("currentId",JSON.parse(currentId))//保存当前的会话窗口的id
        var val=val.sessions
        let userId = [];// 保存存放着id的属性的对象  保存用户的聊天记录
        for (var i = 0; i < val.length; i++) {
            let list = val[i];
            let userListId = {};
            localStorage.setItem(list.id + '-id-content', JSON.stringify(list.messages));// 把每个含有id的对象聊天内容保存本地
            for (var key in list) {
                if (key != "messages") {
                    userListId[key] = list[key]
                }
            }
            userId.push(userListId)
        }
        localStorage.setItem('vue-chat-user', JSON.stringify(userId));
    },
    {
        deep: true
    }
);

export default store;
export const actions = {// mutation有必须同步限制的要求 Action可以通过store.dispatch方法触发mutations中的方法
    initData: ({ dispatch }) => dispatch('INIT_DATA'),
    sendMessage: ({ dispatch }, content) => dispatch('SEND_MESSAGE', content),
    selectSession: ({ dispatch }, id) => dispatch('SELECT_SESSION', id),
    search: ({ dispatch }, value) => dispatch('SET_FILTER_KEY', value),
    changeList: ({ dispatch }, id) => dispatch('CHANGE_LIST', id),
    newInfo: ({ dispatch }, content) => dispatch('NEW_INFO', content),
    addNum: ({ dispatch }, id) => dispatch('ADD_NUM', id),
    removeNum: ({ dispatch }, id) => dispatch('REMOVE_NUM', id),
};

