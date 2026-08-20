import { StyleSheet, View } from 'react-native';
import React from 'react';

import CustomText from '../../../components/CustomText';
import { COLORS } from '../../../utils/COLORS';

import ImageFast from '../../../components/ImageFast';
import { Images } from '../../../assets/images';
import fonts from '../../../assets/fonts';
import QRCode from 'react-native-qrcode-svg';


const hasValue = value =>
    value !== null && value !== undefined && String(value).trim() !== '';

const DetailRow = ({ label, value }) => {
    if (!hasValue(value)) return null;

    return (
        <View style={styles.detailRow}>
            <View style={styles.detailRowLabel}>
                <CustomText label={label} fontSize={13} fontFamily={fonts.medium} color="#45495A" />
            </View>
            <View style={styles.detailRowValue}>
                <CustomText label={value} fontSize={13} fontFamily={fonts.medium} color="#283342" />
            </View>
        </View>
    );
};

const getOrdinal = (n) => {
    const num = Number(n);
    if (!num || Number.isNaN(num)) return n;
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${num}th`; // 11th, 12th, 13th
    switch (num % 10) {
      case 1:
        return `${num}st`;
      case 2:
        return `${num}nd`;
      case 3:
        return `${num}rd`;
      default:
        return `${num}th`;
    }
  };

const StudentCard = ({ card }) => {

    const name = card?.student?.name;
    const department = card?.student?.department;
    const program = card?.student?.semester;
    const studentId = card?.student?.student_id;
    const session = card?.student?.session;
    const dob = card?.student?.date_of_birth;
    const bloodGroup = card?.student?.blood_group;
    const issueDate = card?.issue_date;
    const validUpto = card?.valid_until;
    const profilePhoto = card?.student?.profile_photo;
    const avatar = hasValue(profilePhoto)
        ? { uri: profilePhoto }
        : Images.profileimage;
    const footerText = card?.valid_for;
    const qrPayload = card?.qr_payload;
    const semesterLabel = hasValue(program)
        ? String(program).toLowerCase().includes('semester')
            ? program
            : `${getOrdinal(program)} Semester`
        : null;

    return (
        <View style={styles.card}>
            {/* header */}
            <View style={styles.header}>
                <ImageFast
                    source={Images.studentCardHeader}
                    style={styles.studentCardHeader}
                    resizeMode="cover"
                />
            </View>
            {/* body */}
            <View style={styles.body}>
                <View style={styles.profileRow}>
                    <ImageFast source={avatar} style={styles.avatar} />
                    <View style={styles.profileInfo}>
                        {hasValue(name) ? (
                            <CustomText label={name} fontFamily={fonts.bold} fontSize={18} color="#101828" />
                        ) : null}
                        {hasValue(department) ? (
                            <CustomText label={department} fontFamily={fonts.medium} color="#701A73" fontSize={12} />
                        ) : null}
                        {hasValue(semesterLabel) ? (
                            <CustomText label={semesterLabel} fontFamily={fonts.medium} color="#667085" fontSize={12} />
                        ) : null}
                    </View>
                    {hasValue(studentId) ? (
                        <View style={styles.idBox}>
                            <CustomText label="STUDENT ID" fontFamily={fonts.medium} fontSize={10} color="#667085" />
                            <CustomText label={studentId} fontFamily={fonts.bold} color="#701A73" fontSize={14} />
                        </View>
                    ) : null}
                </View>
                <View style={styles.divider} />
                <View style={styles.detailsSection}>
                    <View style={styles.detailsLeft}>
                        <DetailRow label="Department" value={department} />
                        <DetailRow label="Session" value={session} />
                        <DetailRow label="Date of Birth" value={dob} />
                        <DetailRow label="Blood Group" value={bloodGroup} />
                        <DetailRow label="Issue Date" value={issueDate} />
                        <DetailRow label="Valid Upto" value={validUpto} />
                    </View>
                    <View style={styles.qr}>
                        <QRCode
                            value={qrPayload}
                            size={84}
                            backgroundColor="#FFFFFF"
                            color="#000000"
                        />
                    </View>
                </View>
            </View>
            {/* footer */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <View style={styles.footerLeft}>
                        <ImageFast source={Images.busLogo} style={styles.busIcon} />
                        <CustomText label={footerText} color="#fff" fontSize={12} />
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
        width: '100%',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
    },
    header: {
        width: '100%',
        height: 87,
        backgroundColor: '#701A73',
        overflow: 'hidden',
    },
    studentCardHeader: {
        width: '100%',
        height: '100%',
    },
    body: {
        width: '100%',
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
        width: '100%',
        backgroundColor: '#701A73',
        padding: 18,
        borderTopWidth: 2,
        borderColor: '#F5C518',
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