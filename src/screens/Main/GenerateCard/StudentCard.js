import { StyleSheet, View } from 'react-native';
import React from 'react';

import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';

const CARD_DATA = {
    name: 'Nimra Sultan',
    department: 'Computer Science',
    program: 'BSCS - 4th Semester',
    studentId: '23-CS-1027',
    session: '2023 - 2027',
    dob: '12 Feb 2003',
    bloodGroup: 'B+',
    issueDate: '15 May 2024',
    validUpto: '15 May 2025',
    studentCardHeader: Images.studentCardHeader,
    avatar: Images.placeholderUser,
    qrCode: Images.qrCode,
    signature: Images.signature,
    busLogo: Images.busLogo,
};

const DetailRow = ({ label, value }) => (
    <View style={styles.detailRow}>
        <View style={styles.detailRowLabel}>
        <CustomText label={label} fontSize={14} color="#3E4653" />
        </View>
        <View style={styles.detailRowValue}>
        <CustomText label={value} fontSize={14} fontFamily={fonts.semiBold} color="#292E41" />
        </View>
    </View>
);

const StudentCard = ({ data = CARD_DATA }) => {
    return (
        <View style={styles.card}>
            {/* header */}
            <View style={styles.header}>
                <ImageFast source={Images.studentCardHeader} style={styles.studentCardHeader} resizeMode="contain" />
            </View>
            {/* body */}
            <View style={styles.body}>
                <View style={styles.profileRow}>
                    <ImageFast source={data.avatar} style={styles.avatar} />
                    <View style={styles.profileInfo}>
                        <CustomText label={data.name} fontFamily={fonts.bold} fontSize={18} color="#101828" />
                        <CustomText label={data.department} color="#701A73" fontSize={12} />
                        <CustomText label={data.program} color="#667085" fontSize={12} />
                    </View>
                    <View style={styles.idBox}>
                        <CustomText label="STUDENT ID" fontSize={10} color="#667085" />
                        <CustomText label={data.studentId} fontFamily={fonts.bold} color="#701A73" fontSize={14} />
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsSection}>
                    <View style={styles.detailsLeft}>
                        <DetailRow label="Department" value={data.department} />
                        <DetailRow label="Session" value={data.session} />
                        <DetailRow label="Date of Birth" value={data.dob} />
                        <DetailRow label="Blood Group" value={data.bloodGroup} />
                        <DetailRow label="Issue Date" value={data.issueDate} />
                        <DetailRow label="Valid Upto" value={data.validUpto} />
                    </View>
                    <ImageFast source={Images.qrCode} style={styles.qr} resizeMode="contain" />
                </View>
            </View>
            {/* footer */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <View style={styles.footerLeft}>
                        <ImageFast source={Images.busLogo} style={styles.busIcon} />
                        <CustomText label="Valid for University Transport" color="#fff" fontSize={12} />
                    </View>
                    <View style={styles.footerRight}>
                        <ImageFast source={Images.signature} style={styles.signature} />
                    </View>
                </View>
            </View>
        </View>
    );
};

export default StudentCard;

const styles = StyleSheet.create({
    card: {
        // backgroundColor: 'green',
        borderRadius: 17,
        overflow: 'hidden',
    },
    header: {
        width: '100%',
    },
    studentCardHeader: {
        width: '100%',
        height: 87,
    },
    body: { 
        backgroundColor: '#fff', 
        padding: 14,
    },
    avatar: { 
        width: 84, 
        height: 84, 
        borderRadius: 8,
    },
    profileRow: { 
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 14,
    },
    profileInfo: {
        gap: 4,
    },
    idBox: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 5,
    },
    divider: { height: 1, backgroundColor: '#EAECF0', },
    detailsSection: { 
        marginTop: 18,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    detailRowLabel: {
        width: 100,
        fontSize: 16,
    },
    detailRowValue: {
        width: 150,
    },
    detailsLeft: {
        flex: 1,
        gap: 14,
    },
    qr: {
        width: 84,
        height: 84,
        alignSelf: 'flex-end',
        marginBottom: 30,
        marginRight: 14,
    },
    detailRow: {
        flexDirection: 'row',
    },
    footer: {
        backgroundColor: '#701A73',
        padding: 18,
        borderTopWidth: 2,
        borderColor: '#F5C518'
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    busIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff'
    },
    signature: {
        width: 76,
        height: 38,
        resizeMode: 'contain',
    },
});