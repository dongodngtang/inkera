/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    TextInput,
    ListView,
    Modal,
    Image,
    View
} from 'react-native';

import VideoPlayerAndroid from './videoPlayerAndroid';
import VideoPlayerIos from './videoPlayerIOS';

import Video from 'react-native-video';
import Dimensions from 'Dimensions';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../common/config';
import request from '../common/request';
import Button from 'react-native-button';


const {width, height} = Dimensions.get('window');

let cachedResults = {
    nextPage: 1,
    items: [],
    total: 0,
}

export default class Detail extends Component {

    constructor(props) {
        super(props);

        this.state = {
            rowData: this.props.rowData,
            rate: 1,
            volume: 1,
            muted: true,
            resizeMode: 'contain',
            paused: false,

            duration: 0.0,
            currentTime: 0.0,


            videoLoaded: false,
            playing: false,
            videoOk: true,

            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2)=> row1 !== row2,
            }),

            isLoadingTail: false,

            animationType: 'fade',//none slide fade
            modalVisible: false,//模态场景是否可见
            transparent: false,//是否透明显示

            content:'',
            isSendingComment:false,


        }

        this._onLoadStart = this._onLoadStart.bind(this);
        this._onLoad = this._onLoad.bind(this);
        this._onProgress = this._onProgress.bind(this);
        this._onEnd = this._onEnd.bind(this);
        this._onError = this._onError.bind(this);

        this._rePlay = this._rePlay.bind(this);

        this._pause = this._pause.bind(this);
        this._resume = this._resume.bind(this);

        this._pop = this._pop.bind(this);

        this._renderRow = this._renderRow.bind(this);

        this._fetchMoreData = this._fetchMoreData.bind(this);
        this._fetchData = this._fetchData.bind(this);
        this._renderFooter = this._renderFooter.bind(this);
        this._renderHeader = this._renderHeader.bind(this);

        this._focus = this._focus.bind(this);
        this._blur = this._blur.bind(this);


        this._setModalVisible = this._setModalVisible.bind(this);

        this._startShow = this._startShow.bind(this);

        this._closeModal =this._closeModal.bind(this);

        this._submit = this._submit.bind(this);

    }


    _resume() {
        if (this.state.paused) {
            this.setState({
                paused: false
            });
        }


    }

    _pause() {
        if (!this.state.paused) {
            this.setState({
                paused: true
            });
        }
    }

    _rePlay() {

        this.refs.videoPlayer.seek(0);


    }


    _onLoadStart() {
        console.log('_onLoadStart');
    }

    _onLoad(data) {
        console.log('_onLoad----视频总长度:' + data.duration);
        this.setState({duration: data.duration});
    }

    _onProgress(data) {

        if (!this.state.videoLoaded) {
            this.setState({
                videoLoaded: true,
            });
        }

        if (!this.state.playing) {
            this.setState({
                playing: true,
            });
        }

        // console.log('_onProgress----数据对象：'+JSON.stringify(data));
        this.setState({currentTime: data.currentTime});
        // console.log('_onProgress----当前时间：'+data.currentTime);
    }

    _onEnd() {
        this.setState({

                currentTime: this.state.duration,
                playing: false,

            }
        );
        console.log('_onEnd');
        // alert('onEnd')
    }

    _onError(error) {
        console.log('错误：' + JSON.stringify(error));
        this.setState({
            videoOk: false,
        });
    }


    getCurrentTimePercentage() {
        if (this.state.currentTime > 0) {
            return parseFloat(this.state.currentTime) / parseFloat(this.state.duration);
        } else {
            return 0;
        }
    }


    render() {
        let rowData = this.state.rowData;


        // console.log('视频播放地址：'+rowData.video);

        const flexCompleted = this.getCurrentTimePercentage() * 100;
        const flexRemaining = (1 - this.getCurrentTimePercentage()) * 100;


        return (

            <View style={styles.container}>


                <View style={styles.header}>

                    <TouchableOpacity
                        style={styles.backBox}
                        onPress={this._pop}
                    >

                        <Icon name='ios-arrow-back'
                              style={styles.backIcon}
                        />

                        <Text style={styles.backText}>返回</Text>

                    </TouchableOpacity>


                    <Text style={styles.headerTitle} numberOfLines={1}>视频详情页面</Text>


                </View>


                <View style={styles.videoBox}>

                    <Video
                        source={{uri: rowData.video}}
                        style={styles.video}
                        rate={this.state.rate}
                        paused={this.state.paused}
                        volume={this.state.volume}
                        muted={this.state.muted}
                        resizeMode={this.state.resizeMode}
                        repeat={false}

                        ref="videoPlayer"

                        onLoadStart={this._onLoadStart}
                        onLoad={this._onLoad}
                        onProgress={this._onProgress}
                        onEnd={this._onEnd}
                        onError={this._onError}


                    />

                    {!this.state.videoOk ?
                        <Text style={styles.failText}>很抱歉,视频出错啦！</Text>
                        : null}


                    {!this.state.videoLoaded ?
                        <ActivityIndicator color="red" size="large"
                                           style={styles.loading}/>
                        : null}


                    {this.state.videoLoaded && !this.state.playing ?
                        <Icon
                            name='ios-play'
                            size={45}
                            onPress={this._rePlay}
                            style={styles.play}/>
                        : null}


                    {this.state.videoLoaded && this.state.playing ?
                        <TouchableOpacity
                            onPress={this._pause}
                            style={styles.pauseArea}
                        >

                            {this.state.paused ?
                                <Icon
                                    name='ios-play'
                                    size={45}
                                    onPress={this._resume}
                                    style={styles.play}/>
                                : null}


                        </TouchableOpacity>
                        : null}


                    <View style={styles.progress}>
                        <View style={[styles.innerProgressCompleted, {flex: flexCompleted}]}/>
                        <View style={[styles.innerProgressRemaining, {flex: flexRemaining}]}/>
                    </View>

                </View>


                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this._renderRow}
                    onEndReached={this._fetchMoreData}
                    onEndReachedThreshold={20}
                    renderFooter={this._renderFooter}
                    renderHeader={this._renderHeader}
                    enableEmptySections={true}
                    automaticallyAdjustContentInsets={false}
                    showsVerticalScrollIndicator={false}
                />


                <Modal
                    animationType={this.state.animationType}
                    transparent={this.state.transparent}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this._setModalVisible(false)
                    } }
                    onShow={this._startShow}
                >

                    <View style={styles.modalContainer}>

                        <Icon
                            name='ios-close-outline'
                            size={45}
                            onPress={this._closeModal}
                            style={styles.closeIcon}/>


                        <View style={styles.commentBox}>
                            <View style={styles.comment}>

                                <TextInput
                                    placeholder='过来评论一下吧'
                                    style={styles.content}
                                    multiline={true}
                                    underlineColorAndroid='transparent'
                                    keyboardType='default'
                                    defaultValue={this.state.content}
                                    onChangeText={(text)=>{
                                        this.setState({
                                            content:text
                                        });
                                    }}
                                />

                            </View>

                        </View>


                        <Button
                         style={styles.submitButton}
                         onPress = {this._submit}
                        >评论一下</Button>




                    </View>

                </Modal>


            </View>

        );
    }

    _submit(){
        //post comment

        // alert('开始评论了')
        if(!this.state.content){
            return alert('评论内容不能为空');
        }

        if(this.state.isSendingComment){
            return alert('正在发送评论');
        }

        //第一次发生评论

        this.setState({
            isSendingComment:true
        },()=>{
           let body={
               accessToken:'wewefeo',
               id_video:'12333',
               content:this.state.content,
           }
           let url = config.api.base + config.api.comment;
            request.post(url,body)
                .then(
                    (data)=>{
                        if(data && data.success){
                            let itmes = cachedResults.items.slice();
                            itmes = [{
                                content:this.state.content,
                                replyBy:{
                                    nickname:'dfy',
                                    avatar:'http://dummyimage.com/640x640/967776)'
                                }
                            }].concat(itmes);

                            cachedResults.items = itmes;
                            cachedResults.total = cachedResults.total +1;
                            this.setState({
                                dataSource:this.state.dataSource.cloneWithRows(cachedResults.items),
                                isSendingComment:false,
                                content:''
                            });

                            this._setModalVisible(false);


                        }
                    }

                ).catch((err)=>{
                    console.log(err);
                    this.setState({
                        isSendingComment:false,
                    });
                    this._setModalVisible(false);
                    alert('评论失败，请稍后重试');
            });

        });

    }

    _setModalVisible(visible){
        this.setState({ modalVisible: visible });
    }

    _startShow(){
        console.log('开始显示modal');
    }

    _closeModal(){
        this._setModalVisible(false);
    }

    //加载更多的数据 上拉加载更多  滑动分页
    _fetchMoreData() {

        if (!this._hasMore() || this.state.isLoadingTail) {
            return
        }

        //去服务器请求加载更多的数据了

        let page = cachedResults.nextPage;

        this._fetchData(page)

    }

    _fetchData(page) {


        this.setState({
            isLoadingTail: true
        });


        console.log('封装后的异步请求网络get');

        request.get(config.api.base + config.api.comments, {
            accessToken: 'jjjj',
            id: '2333399',
            page: page
        }).then(
            (data)=> {

                if (data.success) {
                    //把服务器得到的数据存到缓存里面
                    let items = cachedResults.items.slice();


                    items = items.concat(data.data);

                    cachedResults.nextPage += 1


                    cachedResults.items = items
                    cachedResults.total = data.total


                    console.log('总个数据的长度是：' + cachedResults.total);
                    console.log('当前的listview数据的总长度是：' + cachedResults.items.length);


                    setTimeout(()=> {


                        this.setState({
                            dataSource: this.state.dataSource.cloneWithRows(
                                cachedResults.items
                            ),
                            isLoadingTail: false
                        });


                    }, 200);


                }

            }
        ).catch(
            (err) => {

                this.setState({
                    isLoadingTail: false
                });


                console.log('err' + err);
            }
        )
    }

    _hasMore() {
        return cachedResults.items.length !== cachedResults.total
    }

    _renderFooter() {
        if (!this._hasMore() && cachedResults.total !== 0) {
            return (<View style={styles.loadingMore}>
                <Text style={styles.loadingText}>没有更多数据啦...</Text>
            </View>);
        }

        if (!this.state.isLoadingTail) {
            return <View style={styles.loadingMore}/>
        }

        return (

            <ActivityIndicator
                style={styles.loadingMore}
            />

        );
    }

    _renderHeader() {
        let rowData = this.state.rowData;

        return (

            <View style={styles.listHeader}>

                <View
                    style={styles.infoBox}
                >

                    <Image
                        style={styles.avatar}
                        source={{uri: rowData.author.avatar}}
                    ></Image>

                    <View style={styles.descBox}>
                        <Text style={styles.nickname}>视频作者:{rowData.author.nickname}</Text>
                        <Text style={styles.title}>视频标题:{rowData.title}</Text>

                    </View>

                </View>

                <View style={styles.commentBox}>
                    <View style={styles.comment}>

                        <TextInput
                            placeholder='过来评论一下吧'
                            underlineColorAndroid='transparent'
                            keyboardType='default'
                            style={styles.content}
                            multiline={true}
                            onFocus={this._focus}
                            onBlur={this._blur}
                            defaultValue={this.state.content}
                            onChangeText={(text)=>{
                                this.setState({
                                    content:text
                                });
                            }}
                        />

                    </View>

                    {Platform.OS === 'ios' ? null :

                        <View style={styles.btn}>
                            <Text style={styles.submitComment} onPress={this._submit}>评论</Text>

                        </View>
                    }


                </View>

                <View style={styles.commentArea}>
                    <Text style={styles.commentTitle}>精彩评论</Text>
                </View>

            </View>

        );
    }


    _focus() {
        console.log('获得焦点');


        if(Platform.OS === 'ios'){
            this._setModalVisible(true);

        }else {
            //android

        }





    }

    _blur() {
        console.log('失去焦点');
    }


    _pop() {
        let {navigator} = this.props;
        if (navigator) {
            navigator.pop();
        }
    }


    componentDidMount() {
        this._fetchData(1);//从服务器获取的真实数据
    }


    _fetchData2() {

        let url = config.api.base + config.api.comments;

        console.log('视频的id：' + this.state.rowData._id);

        request.get(url, {
            id: '2333399',
            accessToken: 'jjjj'
        }).then(
            (data)=> {
                console.log('服务器返回的:' + JSON.stringify(data));
                if (data && data.success) {
                    let comments = data.data;
                    if (comments && comments.length > 0) {
                        this.setState({
                            dataSource: this.state.dataSource.cloneWithRows(comments)
                        });
                    }
                }

            }
        ).catch((err)=> {
            console.log(err);
        })


    }


    _renderRow(rowData_reply) {
        return (
            <View
                style={styles.replyBox}
                key={rowData_reply._id}
            >

                <Image
                    style={styles.replyAvatar}
                    source={{uri: rowData_reply.replyBy.avatar}}
                ></Image>

                <View style={styles.reply}>
                    <Text style={styles.replyNickname}>{rowData_reply.replyBy.nickname}</Text>
                    <Text style={styles.replyContent}>{rowData_reply.content}</Text>

                </View>


            </View>
        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },


    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: 64,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomWidth: 1,
        borderColor: 'rgba(255,0,0,0.2)',
        backgroundColor: '#fff',
    },

    backBox: {
        position: 'absolute',
        left: 12,
        top: 20,
        width: 60,
        flexDirection: 'row',
        alignItems: 'center',

    },

    backIcon: {
        color: '#999',
        fontSize: 22,
        marginRight: 5
    },

    backText: {
        color: '#999',
        fontSize: 16,
    },

    headerTitle: {
        textAlign: 'center',
        width: width - 120,
        fontSize: 18,
        color: 'red'
    },


    videoBox: {
        width: width,
        height: 240,
        backgroundColor: 'black'
    },
    video: {
        width: width,
        height: 230,
        backgroundColor: 'black'
    },

    loading: {
        position: 'absolute',
        left: 0,
        width: width,
        top: 90,
        backgroundColor: 'transparent',
        alignSelf: 'center',
    },
    progress: {
        flex: 1,
        flexDirection: 'row',
        borderRadius: 3,
        overflow: 'hidden',
    },
    innerProgressCompleted: {
        height: 10,
        backgroundColor: 'red',
    },
    innerProgressRemaining: {
        height: 10,
        backgroundColor: '#cccccc',
    },

    play: {
        position: 'absolute',
        top: 90,
        left: width / 2 - 30,
        width: 60,
        height: 60,
        paddingTop: 10,
        paddingLeft: 22,
        backgroundColor: 'transparent',
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: 30,
        color: '#ed7b66'
    },

    pauseArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: 230,
    },

    failText: {
        position: 'absolute',
        left: 0,
        width: width,
        top: 125,
        backgroundColor: 'transparent',
        textAlign: 'center',
        color: 'red',
        fontSize: 20,
    },

    infoBox: {
        flexDirection: 'row',
        width: width,
        justifyContent: 'center',
        marginTop: 10,
    },
    avatar: {

        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 10,
        marginLeft: 10,


    },
    descBox: {
        flex: 1,
    },
    nickname: {
        fontSize: 18,


    },
    title: {
        marginTop: 8,
        fontSize: 16,
        color: '#666'

    },

    replyBox: {
        flexDirection: 'row',
        width: width,
        justifyContent: 'flex-start',
        marginTop: 10,
    },

    replyAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
        marginLeft: 10,
    },

    reply: {
        flex: 1,
    },

    replyNickname: {
        color: 'red'
    },

    replyContent: {
        marginTop: 4,
        color: 'blue'
    },

    loadingMore: {

        marginVertical: 20
    },

    loadingText: {
        fontSize: 18,
        color: 'red',
        textAlign: 'center'
    },

    listHeader: {
        marginTop: 10,
        width: width,
    },
    commentBox: {
        marginTop: 6,
        padding: 8,
        width: width,
        flexDirection:'row',
    },
    comment: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        flex:1,
    },
    content: {
        paddingLeft: 4,
        color: '#333',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        fontSize: 14,
        height: 50,
    },
    btn:{
        width:45,
        backgroundColor:'#23beff',
        height:50,
        justifyContent:'center',
        alignItems:'center',
        borderWidth: 1,
        borderColor: 'red',
        borderRadius: 4,
        marginLeft:5,

    },
    submitComment:{

        fontSize:14,
        fontWeight:'bold',

    },
    commentArea: {
        width: width,
        paddingBottom: 6,
        paddingLeft: 10,
        paddingRight: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    commentTitle: {
        color: 'red',
    },

    modalContainer:{
        flex:1,
        paddingTop:45,
        backgroundColor:'white',
        alignItems:'center',
    },

    closeIcon:{
        alignSelf:'center',
        fontSize:30,
        marginTop:20,
        color:'red'

    },

    submitButton:{
        width:width-20,
        padding:16,
        marginTop:20,
        marginBottom:20,
        borderWidth:1,
        borderColor:'red',
        borderRadius:4,
        color:'red',
        fontSize:18,
    },



});

