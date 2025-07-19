import * as React from "react";
import {Text, StyleSheet, View, ScrollView, Image, Animated, Easing, TouchableOpacity} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { normalize } from "../../utils/normalize";

interface RecorderActiveProps {
  onClose: () => void;
}

const RecorderActive = ({onClose}: RecorderActiveProps) => {
  	const rotateAnim1 = React.useRef(new Animated.Value(0)).current;
  	const rotateAnim2 = React.useRef(new Animated.Value(0)).current;
  	const rotateAnim3 = React.useRef(new Animated.Value(0)).current;
  
  	React.useEffect(() => {
  		// 创建更流畅的旋转动画
  		const createSmoothRotationAnimation = (animValue: Animated.Value, duration: number) => {
  			return Animated.loop(
  				Animated.timing(animValue, {
  					toValue: 1,
  					duration: duration,
  					useNativeDriver: true,
  					easing: Easing.linear, // 使用线性缓动，避免断触
  				}),
  				{
  					resetBeforeIteration: false // 防止重置时的断触
  				}
  			);
  		};
  
  		// 启动三个不同速度的旋转动画，使用更长的周期避免断触
  		const animation1 = createSmoothRotationAnimation(rotateAnim1, 8000); // 8秒一圈
  		const animation2 = createSmoothRotationAnimation(rotateAnim2, 12000); // 12秒一圈
  		const animation3 = createSmoothRotationAnimation(rotateAnim3, 16000); // 16秒一圈
  
  		// 立即启动所有动画
  		animation1.start();
  		animation2.start();
  		animation3.start();
  
  		return () => {
  			animation1.stop();
  			animation2.stop();
  			animation3.stop();
  		};
  	}, [rotateAnim1, rotateAnim2, rotateAnim3]);
  	
  	return (
    		<SafeAreaView style={styles.recorderActive}>
      			<ScrollView 
      				style={styles.scrollView}
      				contentContainerStyle={styles.scrollContent}
      				showsVerticalScrollIndicator={false}
      				bounces={true}
      			>
      			<View style={[styles.view, styles.viewSpaceBlock]}>
        				<View style={[styles.container, styles.headerFlexBox]}>
          					<View style={styles.content}>
            						<View style={[styles.header, styles.headerFlexBox]}>
                                    <TouchableOpacity 
                                        style={[styles.icons, styles.iconsFlexBox]}
                                        onPress={onClose}
                                        activeOpacity={0.7}
                                    >
                                        <Image style={styles.arrowLeftIcon} resizeMode="cover" source={require("../../assets/bluetooth/bluetooth_return_icon.png")} />
                                    </TouchableOpacity>
              							<View style={[styles.text, styles.iconsFlexBox]}>
                								<Text style={[styles.title, styles.titleTypo]}>Connecting to Lingo...</Text>
              							</View>
              							<View style={[styles.icons1, styles.iconsFlexBox]} />
            						</View>
            						<View style={[styles.time1, styles.iconsFlexBox]}>
              							<View style={[styles.record, styles.iconsFlexBox]}>
                								<View style={styles.timer}>
                                            {/* 第一层旋转图片 */}
                                            <Animated.View style={[
                                                styles.animatedImageContainer,
                                                {
                                                    transform: [{
                                                        rotate: rotateAnim1.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: ['0deg', '360deg'],
                                                            extrapolate: 'clamp'
                                                        })
                                                    }]
                                                }
                                            ]}>
                                                <Image 
                                                    style={styles.animatedImage}
                                                    source={require("../../assets/bluetooth/bluetooth_action1.png")}
                                                    resizeMode="contain"
                                                />
                                            </Animated.View>
                                            
                                            {/* 第二层旋转图片 */}
                                            <Animated.View style={[
                                                styles.animatedImageContainer,
                                                {
                                                    transform: [{
                                                        rotate: rotateAnim2.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: ['0deg', '-360deg'],
                                                            extrapolate: 'clamp'
                                                        })
                                                    }]
                                                }
                                            ]}>
                                                <Image 
                                                    style={styles.animatedImage}
                                                    source={require("../../assets/bluetooth/bluetooth_action2.png")}
                                                    resizeMode="contain"
                                                />
                                            </Animated.View>
                                            
                                            {/* 第三层旋转图片 */}
                                            <Animated.View style={[
                                                styles.animatedImageContainer,
                                                {
                                                    transform: [{
                                                        rotate: rotateAnim3.interpolate({
                                                            inputRange: [0, 1],
                                                            outputRange: ['0deg', '360deg'],
                                                            extrapolate: 'clamp'
                                                        })
                                                    }]
                                                }
                                            ]}>
                                                <Image 
                                                    style={styles.animatedImage}
                                                    source={require("../../assets/bluetooth/bluetooth_action3.png")}
                                                    resizeMode="contain"
                                                />
                                            </Animated.View>
                								</View>
              							</View>
            						</View>
                            <Text style={[styles.longPressLingoPower, styles.lingoTypo]}>{`Long-press Lingo power button for 3 seconds until the signal light turns to twinkling blue.`}</Text>
                            <Text style={[styles.longPressLingoPower, styles.lingoTypo,styles.line2]}>{`Make sure your phone bluetooth is on`}</Text>
                        <TouchableOpacity 
                            style={[styles.buttons, styles.iconsFlexBox]}
                            onPress={() => {
                                // 处理搜索按钮点击事件
                                console.log('Search button pressed');
                            }}
                            activeOpacity={0.8}
                        >
            						<View style={[styles.autoLayoutHorizontal, styles.iconsFlexBox]}>
              							<Text style={[styles.buttonText, styles.titleTypo]}>Searching for nearby device...</Text>
            						</View>
                        </TouchableOpacity>
        				</View>
        				<View style={styles.column}>
          					<Text style={[styles.cantFindLingoContainer, styles.lingoTypo]}>
            						<Text style={styles.text1}>{` `}</Text>
                        <Text style={styles.cantFindLingo}>Can't find Lingo?</Text>
              							</Text>
              							</View>
              							</View>
              							</View>
      			</ScrollView>
  </SafeAreaView>);
};
            						
const styles = StyleSheet.create({
    recorderActive: {
        backgroundColor: "#181819",
        flex: 1
    },
    scrollView: {
        flex: 1,
        backgroundColor: "#181819"
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: normalize(30)
    },
    viewSpaceBlock: {
        paddingVertical: 0,
        flexDirection: "row"
    },
    headerFlexBox: {
        gap: normalize(12),
        alignItems: "center"
    },
    lingoTypo: {
        textAlign: "center",
        fontFamily: "SF Pro",
        letterSpacing: normalize(-0.4)
    },
    line2: {
        marginBottom: normalize(29)
    },
    batteryPosition: {
        right: 0,
        position: "absolute"
    },
    borderPosition: {
        top: 0,
        height: normalize(11)
    },
    iconsFlexBox: {
        justifyContent: "center",
        alignItems: "center"
    },
    titleTypo: {
        lineHeight: normalize(21),
        fontSize: normalize(18),
        textAlign: "center",
        fontFamily: "SF Pro",
        letterSpacing: normalize(-0.4)
    },
    timerLayout: {
        opacity: 0.5,
        maxHeight: "100%",
        maxWidth: "100%",
        position: "absolute",
        overflow: "hidden"
    },
    itemLayout: {
        opacity: 0.3,
        display: "none",
        height: normalize(250),
        width: normalize(250),
        position: "absolute"
    },
    time: {
        fontWeight: "600",
        color: "#fff",
        lineHeight: normalize(20),
        fontSize: normalize(15),
        textAlign: "center",
        fontFamily: "SF Pro",
        letterSpacing: normalize(-0.4)
    },
    border: {
        right: normalize(2),
        borderRadius: normalize(3),
        borderColor: "#fff",
        borderWidth: normalize(1),
        width: normalize(22),
        opacity: 0.35,
        borderStyle: "solid",
        position: "absolute"
    },
    capIcon: {
        top: normalize(4),
        width: normalize(1),
        height: normalize(4),
        opacity: 0.4
    },
    capacity: {
        top: normalize(2),
        right: normalize(4),
        borderRadius: normalize(1),
        backgroundColor: "#fff",
        width: normalize(18),
        height: normalize(7),
        position: "absolute"
    },
    battery: {
        width: normalize(24),
        top: 0,
        height: normalize(11)
    },
    wifiIcon: {
        width: normalize(15),
        height: normalize(11)
    },
    cellularConnectionIcon: {
        width: normalize(17),
        height: normalize(11)
    },
    rightSide: {
        width: normalize(67),
        height: normalize(11)
    },
    statusBar: {
        height: normalize(30),
        justifyContent: "space-between",
        paddingHorizontal: normalize(14),
        gap: 0,
        alignSelf: "stretch",
        paddingVertical: normalize(12),
        alignItems: "center",
        flexDirection: "row"
    },
    arrowLeftIcon: {
        width: "100%",
        height: "100%"
    },
    icons: {
        borderRadius: normalize(12),
        backgroundColor: "#3e3e3e",
        height: normalize(40),
        width: normalize(40),
        justifyContent: "center",
        flexDirection: "row"
    },
    title: {
        color: "#fff",
        flex: 1
    },
    text: {
        flexDirection: "row",
        flex: 1
    },
    icons1: {
        borderRadius: normalize(15),
        height: normalize(40),
        width: normalize(40),
        justifyContent: "center"
    },
    header: {
        alignSelf: "stretch",
        flexDirection: "row"
    },
    timerChild: {
        height: "98.38%",
        width: "98.81%",
        top: "0.76%",
        right: "0.53%",
        bottom: "0.86%",
        left: "0.66%"
    },
    timerItem: {
        height: "73%",
        width: "69.19%",
        top: "15.14%",
        right: "15.38%",
        bottom: "11.86%",
        left: "15.44%"
    },
    timerInner: {
        height: "89.06%",
        width: "90.22%",
        top: "4.77%",
        right: "4.49%",
        bottom: "6.17%",
        left: "5.29%"
    },
    timer: {
        width: normalize(320),
        shadowColor: "#708a6f",
        shadowOffset: {
            width: 0,
            height: normalize(7.099007606506348)
        },
        shadowRadius: normalize(47.92),
        elevation: normalize(47.92),
        shadowOpacity: 1,
        height: normalize(320),
        justifyContent: "center",
        alignItems: "center"
    },
    animatedImageContainer: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0
    },
    animatedImage: {
        width: normalize(280),
        height: normalize(280),
        opacity: 0.8
    },
    record: {
        height: normalize(370),
        paddingHorizontal: normalize(1),
        alignSelf: "stretch",
        paddingVertical: 0,
        flexDirection: "row"
    },
    time1: {
        height: normalize(333),
        alignSelf: "stretch"
    },
    longPressLingoPower: {
        width: normalize(261),
        color: "#b0b0b0",
        lineHeight: normalize(20),
        fontSize: normalize(15),
        textAlign: "center",
        fontFamily: "SF Pro",
        letterSpacing: normalize(-0.4)
    },
    buttonText: {
        fontWeight: "700",
        color: "#fff"
    },
    autoLayoutHorizontal: {
        alignSelf: "stretch",
        flexDirection: "row"
    },
    buttons: {
        borderRadius: normalize(50),
        borderColor: "#85f380",
        borderWidth: normalize(2),
        height: normalize(74),
        paddingHorizontal: normalize(16),
        borderStyle: "solid",
        alignSelf: "stretch",
        paddingVertical: normalize(12)
    },
    content: {
        gap: normalize(29),
        alignSelf: "stretch",
        alignItems: "center"
    },
    text1: {
        color: "#3e3e3e"
    },
    cantFindLingo: {
        color: "#85f380"
    },
    cantFindLingoContainer: {
        fontSize: normalize(13),
        textDecorationLine: "underline",
        lineHeight: normalize(18),
        textAlign: "center",
        fontFamily: "SF Pro",
        letterSpacing: normalize(-0.4),
        flex: 1
    },
    column: {
        alignSelf: "stretch",
        flexDirection: "row"
    },
    container: {
        paddingHorizontal: 0,
        zIndex: 0,
        paddingVertical: normalize(12),
        minHeight: normalize(812),
        gap: normalize(12),
        flex: 1
    },
    child: {
        top: normalize(-80),
        left: normalize(-108),
        zIndex: 1
    },
    item: {
        top: normalize(642),
        left: normalize(233),
        zIndex: 2
    },
    view: {
        width: "100%",
        paddingHorizontal: normalize(24),
        gap: normalize(10),
        alignItems: "center",
        overflow: "hidden",
        paddingVertical: 0,
        minHeight: normalize(812),
        backgroundColor: "#181819",
        flex: 1
    }
});

export default RecorderActive;
            						