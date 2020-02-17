import React, { useState, useCallback, useEffect, useContext } from 'react';
import { StyleSheet, Linking, Text, View, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Share from 'react-native-share';

import AppContext from '../../contexts/AppContext';

function formatDate(date) {
    const year = date.toString().substring(0, 4);
    const month = date.toString().substring(4, 6);
    const day = date.toString().substring(6, 8);

    return `${day}/${month}/${year}`;
}

const EpisodeDetail = ({ navigation, route }) => {
    const { socket } = useContext(AppContext);

    const [episodeInfo, setEpisodeInfo] = useState(null);
    const [myInteraction, setMyInteraction] = useState(null);
    const [userCount, setUserCount] = useState(0);
    const [score, setScore] = useState(0);
    const [likes, setLikes] = useState(0);

    navigation.setOptions({
        title: episodeInfo ? episodeInfo.title : '',
    });

    useEffect(() => {
        socket.emit('join', { episodeId: route.params.id });

        socket.on('episodeInfo', data => {
            console.log(data);
            setEpisodeInfo({ ...data, date: formatDate(data.date) });
        });

        socket.on('myInteraction', data => {
            setMyInteraction(data);
        });

        socket.on('userCount', data => {
            setUserCount(data);
        });

        socket.on('statsUpdated', data => {
            setScore(data.score);
            setLikes(data.likes);
        });

        // return () => {
        //     socket.emit('leave', { episodeId: route.params.id });
        // };
    }, [route.params.id, socket]);

    const toggleLike = useCallback(() => {
        socket.emit('updateInteraction', {
            episodeId: episodeInfo._id,
            like: !myInteraction.like,
            score: myInteraction.score,
            review: myInteraction.review,
        });
    }, [episodeInfo, myInteraction, socket]);

    const toggleStars = useCallback(
        stars => {
            socket.emit('updateInteraction', {
                episodeId: episodeInfo._id,
                like: myInteraction.like,
                score: stars,
                review: myInteraction.review,
            });
        },
        [episodeInfo, myInteraction, socket]
    );

    const handleShare = useCallback(async () => {
        try {
            await Share.open({
                title: 'Glo+',
                message: `Venha assistir ${episodeInfo.title} no Glo+ às ${episodeInfo.date} ${episodeInfo.time}`,
                url: `http://gloplus.com.br/${episodeInfo._id}`,
            });
        } catch {
            console.log('No shared!');
        }
    }, [episodeInfo]);

    return (
        <LinearGradient colors={['#9bcbc9', '#616161']} style={styles.container}>
            {episodeInfo && (
                <>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="account" style={{ fontSize: 25, color: 'black' }} />
                            <Text style={{ fontSize: 20, color: 'black' }}>{userCount}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, color: 'black' }}>
                                {episodeInfo.date} - {episodeInfo.time}
                            </Text>
                        </View>
                    </View>

                    <Image
                        resizeMode={'cover'}
                        style={{ width: '100%', height: 200 }}
                        source={{ uri: episodeInfo.thumb }}
                    />

                    <Text style={{ fontSize: 20, textAlign: 'center', marginTop: 5 }}>{episodeInfo.title}</Text>
                    <Text>{episodeInfo.description}</Text>
                    {episodeInfo.link && (
                        <Text style={{ color: 'blue' }} onPress={() => Linking.openURL(episodeInfo.link)}>
                            Ver site
                        </Text>
                    )}

                    {episodeInfo.moreInfo.length ? <Text>Mais Informações:</Text> : <></>}
                    {episodeInfo.moreInfo.map(i => (
                        <View key={i.key}>
                            <Text>
                                {i.key}: {i.value}
                            </Text>
                        </View>
                    ))}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <Text>Nota Média: {score || '-'}</Text>
                        <Text>Globadas: {likes || 0}</Text>
                    </View>

                    {myInteraction && (
                        <>
                            <Text>Minha Avaliação</Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity onPress={() => toggleStars(1)}>
                                        <Icon
                                            style={myInteraction.score >= 1 ? styles.aliveStar : styles.deadStar}
                                            name="star-face"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStars(2)}>
                                        <Icon
                                            style={myInteraction.score >= 2 ? styles.aliveStar : styles.deadStar}
                                            name="star-face"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStars(3)}>
                                        <Icon
                                            style={myInteraction.score >= 3 ? styles.aliveStar : styles.deadStar}
                                            name="star-face"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStars(4)}>
                                        <Icon
                                            style={myInteraction.score >= 4 ? styles.aliveStar : styles.deadStar}
                                            name="star-face"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => toggleStars(5)}>
                                        <Icon
                                            style={myInteraction.score >= 5 ? styles.aliveStar : styles.deadStar}
                                            name="star-face"
                                            size={24}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={toggleLike}>
                                    <Icon name="earth" size={24} />
                                    {myInteraction.like ? <Text>DeGlobar!</Text> : <Text>Globar!</Text>}
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleShare}>
                                    <Icon name="share" size={24} />
                                    <Text>Compartilhar</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={{ backgroundColor: 'blue', color: 'white' }}
                        onPress={() => navigation.navigate('EpisodioChat', { id: episodeInfo._id })}
                    >
                        <Text>Entrar no chat</Text>
                    </TouchableOpacity>
                </>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        paddingTop: 80,
    },

    aliveStar: {
        opacity: 1,
    },

    deadStar: {
        opacity: 0.2,
    },
});

export default EpisodeDetail;
