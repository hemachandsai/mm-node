import VisitorHealthDao from './visitor-health.dao';
import VisitorDiagnosticDao from './visitor-diagnostic.dao';
import VisitorReportDao from './visitor-report.dao';
import VisitorPrescriptionDao from './visitor-prescription.dao';
import VisitorHistoryDao from './visitor-history.dao';
import VisitorMediaDao from './visitor-media.dao';
import VisitorAppointmentDao from './visitor-appointment.dao';
import VisitorStoreDao from './visitor-store.dao';
import VisitorDao from './visitor.dao';
import visitorStoreModel from './index';
import visitorAppointmentModel from './index';
import log from '../../config/log4js.config';
import visitorModel from './index';
import visitorReportModel from './index';
import VisitorTimelineDao from './visitor-timeline.dao';
import UserDao from '../user/user.dao';
import billingModel from '../billing/index';
import sequelize from '../../util/conn.mysql';
const Promise = require('bluebird');
const moment = require('moment');
const Op = require('sequelize').Op;
const visitorHealthDao = new VisitorHealthDao();
const visitorDao = new VisitorDao();
const visitorDiagnosticDao = new VisitorDiagnosticDao();
const visitorReportDao = new VisitorReportDao();
const visitorPrescriptionDao = new VisitorPrescriptionDao();
const visitorHistoryDao = new VisitorHistoryDao();
const visitorMediaDao = new VisitorMediaDao();
const visitorAppointmentDao = new VisitorAppointmentDao();
const visitorStoreDao = new VisitorStoreDao();
const visitorTimelineDao = new VisitorTimelineDao();
const userDao = new UserDao();

/**
 * VisitorService 
 */
class VisitorService {

    //for visitor-health
    createHealth(visitorHealth, callback) {
        visitorHealthDao.insert(visitorHealth, (visitorHealthCreated) => {
            callback(visitorHealthCreated);
        });
    }

    readAllHealth(callback) {
        visitorHealthDao.readAll((allVisitorHealth) => {
            callback(allVisitorHealth);
        });
    }
    readVisitorInfo(visitorId, callback) {
        visitorDao.readById(visitorId, (result)=>{
            callback(result);
        })
    }
    readByVisitorIdHealth(visitorId, callback) {
        visitorHealthDao.readById(visitorId, (visitorHealth) => {
            callback(visitorHealth);
        });
    }

    //for visitor-prescription
    updatePrescription(visitorPrescription, callback) {
        var prescription = {
            analysis: null,
            issue: visitorPrescription.issue,
            medication: visitorPrescription.medication,
            diagnostic: visitorPrescription.diagnostic,
            instructions: visitorPrescription.instructions,
            description: visitorPrescription.description,
            prescription: null
        }
        visitorModel.visitor_prescription.update(prescription, {
            where: {
                consultationId: visitorPrescription.consultationId,
                doctorId: visitorPrescription.doctorId
            }
        }).then(() => {});
    }

    readAllPrescription(callback) {
        visitorPrescriptionDao.readAll((allVisitorPrescription) => {
            callback(allVisitorPrescription);
        });
    }

    readByVisitorIdPrescription(visitorId, callback) {
        visitorPrescriptionDao.readById(visitorId, (visitorPrescription) => {
            callback(visitorPrescription);
        });
    }

    //for visitor-diagnostic
    createDiagnostic(visitorDiagnostic, callback) {
        visitorDiagnosticDao.insert(visitorDiagnostic, (diagnosticCreated) => {
            callback(diagnosticCreated);
        });
    }

    readAllDiagnostic(callback) {
        visitorDiagnosticDao.readAll((allDiagnostic) => {
            callback(allDiagnostic);
        });
    }

    //for visitor-reports
    createReport(visitorReport, callback) {
        visitorReportDao.insert(visitorReport, (visitorReportCreated) => {
            callback(visitorReportCreated);
        });
    }

    readAllReport(callback) {
        visitorReportDao.readAll((allReports) => {
            callback(allReports);
        });
    }

    readByVisitorIdReport(visitorId, callback) {
        visitorReportDao.readById(visitorId, (reports) => {
            callback(reports);
        });
    }

    updateVisitorReport(visitorReport, callback) {
        visitorReportDao.update(visitorReport, (visitorReportUpdated) => {
            callback(visitorReportUpdated);
        });
    }

    readReportById(id, callback) {
        visitorModel.visitor_report.find({ where: { id: id } })
            .then((visitorReport) => {
                log.info('Read report by id ' + JSON.stringify(visitorReport));
                callback(visitorReport);
            });
    }

    //for visitor-history
    createHistory(visitorHistory, callback) {
        visitorHistoryDao.insert(visitorHistory, (visitorHistoryCreated) => {
            callback(visitorHistoryCreated);
        });
    }

    readAllHistory(callback) {
        visitorHistoryDao.readAll((allVisitorHistory) => {
            callback(allVisitorHistory);
        });
    }

    //for visitor-media
    createMedia(visitorMedia, callback) {
        visitorMediaDao.insert(visitorMedia, (visitorMediaCreated) => {
            callback(visitorMediaCreated);
        });
    }

    readAllMedia(callback) {
        visitorMediaDao.readAll((allVisitorMedia) => {
            callback(allVisitorMedia);
        });
    }

    //for visitor-appointment
    createAppointment(visitorAppointment, callback) {
        visitorAppointmentDao.insert(visitorAppointment, (visitorAppointmentCreated) => {
            callback(visitorAppointmentCreated);
        });
    }

    readAllAppointment(callback) {
        visitorAppointmentDao.readAll((allVisitorAppointment) => {
            callback(allVisitorAppointment);
        });
    }

    readByIdAppointment(visitorId, callback) {
        visitorAppointmentDao.readById(visitorId, (visitorAppointment) => {
            callback(visitorAppointment);
        });
    }

    getAppointmentDetails(visitorId, doctorId, groupId, callback) {
        visitorModel.visitor_appointment.find({ where: { visitorId: visitorId, doctorId: doctorId, groupId: groupId } })
            .then((appointmentDetails) => {
                callback(appointmentDetails);
            });
    }

    async readAppointmentHistory(visitorId, callback) {
        var consultations;
        // var reports = new Array(12);
        // var vitals = new Array(12);
        await sequelize.query(`select u.firstname,u.lastname,u.picUrl,v.speciality,v.startTime,v.status from 
        user as u, visitor_appointment as v where v.visitorId = ${visitorId} and 
        v.doctorId = u.id  
        order by startTime desc 
        limit 10`,{type: sequelize.QueryTypes.SELECT}).then((result)=>{
            consultations = result;
        })
        // await visitorModel.visitor_appointment.findAll({
        //     where: {
        //         visitorId: visitorId
        //     }
        // }).then((visitorAppointment) => {
        //     console.log(visitorAppointment);
        //     consultations.fill(0); //initialize the array with the initial value
        //     visitorAppointment.map((appointment) => {
        //         var startMonth = appointment.startTime.getUTCMonth();
        //         var endMonth = appointment.endTime.getUTCMonth();
        //         for (var i = startMonth; i <= endMonth; i++) {
        //             consultations[i] = consultations[i] + 1;
        //         }
        //     });
        // });

        // await visitorModel.visitor_report.findAll({
        //     where: {
        //         visitorId: visitorId
        //     }
        // }).then((visitorReport) => {
        //     reports.fill(0); //initialize the array with the initial value
        //     visitorReport.map((report) => {
        //         var createdAtMonth = report.createdAt.getUTCMonth();
        //         var updatedAtMonth = report.updatedAt.getUTCMonth();
        //         for (var i = createdAtMonth; i <= updatedAtMonth; i++) {
        //             reports[i] = reports[i] + 1;
        //         }
        //     });
        // });

        // await visitorModel.visitor_health.findAll({
        //     where: {
        //         visitorId: visitorId
        //     }
        // }).then((visitorHealth) => {
        //     vitals.fill(0); //initialize the array with the initial value
        //     visitorHealth.map((health) => {
        //         var createdAtMonth = health.createdAt.getUTCMonth();
        //         var updatedAtMonth = health.updatedAt.getUTCMonth();
        //         for (var i = createdAtMonth; i <= updatedAtMonth; i++) {
        //             vitals[i] = vitals[i] + 1;
        //         }
        //     });
        // });
        //send the required history details to fill the consultation history graph on visitor-dashboard
        callback({
            "consultations": 
                 consultations
            // ,
            // "reports": {
            //     "monthly": reports
            // },
            // "vitals": {
            //     "monthly": vitals
            // }
        });
    }

    //for visitor-store
    createStore(visitorStore, callback) {
        visitorStoreDao.insert(visitorStore, (visitorStoreCreated) => {
            callback(visitorStoreCreated);
        });
    }

    readAllStore(callback) {
        visitorStoreDao.readAll((allVisitorStore) => {
            callback(allVisitorStore);
        });
    }

    getVisitorStoreById(visitorId, callback) {
        visitorStoreModel.visitor_store
            .findAll({
                where: {
                    visitorId: visitorId
                }
            }) //fetch all the records for the visitorId
            .then((visitorStores) => {
                callback(visitorStores);
            }).catch(err => {
                log.error('Error while fetching visitor stores in visitor service: ', err.stack);
                callback({
                    message: 'Visitor ID you have entered does not exist'
                });
            });
    }

    //for visitor-timeline
    createVisitorTimeline(visitorTimeline, callback) {
        visitorTimelineDao.insert(visitorTimeline, (visitorTimelineCreated) => {
            callback(visitorTimelineCreated);
        });
    }

    readTimelineByVisitorId(visitorId, callback) {
        visitorModel.visitor_timeline
            .findAll({
                where: {
                    visitorId: visitorId
                },
                limit: 3,
                order: [
                    [visitorModel, 'timestamp', 'DESC']
                ]
            }).then((visitorTimelines) => {
                callback(visitorTimelines);
            }).catch(err => {
                log.error('Error while fetching visitor timeline in visitor service: ', err);
                callback({
                    message: 'Visitor ID you have entered does not exist'
                });
            });
    }


    /**
     *
     * get consultations for consultations page
     * @param {*} visitorId
     * @param {*} page
     * @param {*} size
     * @param {*} callback
     * @memberof VisitorService
     */
    
        // select v.url as prescriptionUrl,v.Instructions,v.analysis,v.speciality,
        // v.consultationMode,v.updatedAt,b.url as billingUrl,u.picUrl,u.firstname,u.lastname 
        // from visitor_prescription as v, billing as b, user as u 
        // WHERE
        // v.visitorId = ${visitorId} and v.doctorId = u.id and v.consultationId = b.consultationId
        // order by v.updatedAt DESC
        // limit ${size}
        // offset ${(size * page - size)}
    readAllConsultationsByVisitorId(visitorId, high, low, callback) {
        console.log(low);
        console.log(high);
        sequelize.query(`
        select vp.url as prescriptionUrl,vp.Instructions,vp.analysis,vp.issue ,v.speciality,v.status,
        v.consultationMode,v.updatedAt,b.url as billingUrl,u.picUrl,u.firstname,u.lastname 
        from 
        (select * from visitor_appointment where visitorId = ${visitorId} and  createdAt between ${low} and ${high}) v
        inner join billing b 
        on v.visitorId = b.visitorId and v.consultationId = b.consultationId
        left join visitor_prescription vp
        on vp.consultationId = v.consultationId
        left join user u 
        on v.doctorId = u.id
        order by v.updatedAt DESC
        `,{type: sequelize.QueryTypes.SELECT}).then((prescriptions)=>{
            callback({'prescriptions': prescriptions})
        })
    }
    readConsultationsByVisitorId(visitorId, page, size, callback) {
        sequelize.query(`
        select vp.url as prescriptionUrl,vp.Instructions,vp.analysis,v.speciality,v.status,
        v.consultationMode,v.updatedAt,b.url as billingUrl,u.picUrl,u.firstname,u.lastname 
        from 
        (select * from visitor_appointment where visitorId = ${visitorId}) v
        inner join billing b 
        on v.visitorId = b.visitorId and v.consultationId = b.consultationId
        left join visitor_prescription vp
        on vp.consultationId = v.consultationId
        left join user u 
        on v.doctorId = u.id
        order by v.updatedAt DESC
        limit ${size}
        offset ${(size * page - size)}
        `,{type: sequelize.QueryTypes.SELECT}).then((prescriptions)=>{
            callback({'prescriptions': prescriptions})
        })
    }
    getReportsByVisitorId(visitorId, high, low, callback) {
        console.log(high)
        console.log(low);
        visitorReportModel.visitor_report.findAll({
            where: { visitorId: visitorId,
            createdAt: {
                [Op.between]: [low, high]
            }}
        })
        .then((visitorReport) => {
            callback(visitorReport);
        });
        // visitorReportDao.readById(visitorId, (result) => {
        //     callback(result);
        // })
    }

    async getDoctorDetail(visitorPrescriptions) {
        return Promise.map(visitorPrescriptions, prescription => {
            return new Promise((resolve, reject) => {
                userDao.readById(prescription.doctorId, (doctorInfo) => {
                    billingModel.billing.find({
                        where: {
                            consultationId: prescription.consultationId,
                            doctorId: prescription.doctorId
                        }
                    }).then((billing) => {
                        if (billing) {
                            resolve({ prescription: prescription, doctorInfo: user, billing: billing });
                        } else {
                            resolve({ prescription: prescription, doctorInfo: user, billing: null });
                        }
                    });
                });
            });
        });
    }
    
    getAllConsultationsByDoctorId(doctorId, high, low, callback) {
        sequelize.query(`
        select vp.url as prescriptionUrl,vp.Instructions,vp.analysis,vp.issue, v.speciality,v.status,
        v.consultationMode,v.updatedAt,b.url as billingUrl,u.picUrl,u.firstname,u.lastname 
        from 
        (select * from visitor_appointment where doctorId = ${doctorId} and createdAt between ${low} and ${high}) v
        left join billing b 
        on v.doctorId = b.doctorId and v.consultationId = b.consultationId
        left join visitor_prescription vp
        on vp.consultationId = v.consultationId
        left join user u 
        on v.visitorId = u.id
        order by v.updatedAt DESC
        `,{type: sequelize.QueryTypes.SELECT}).then((prescriptions)=>{
            callback({'consultations': prescriptions})
        })
    }

    //all consultations by doctor id
    readAllConsultationsByDoctorId(doctorId, page, size, callback) {
        sequelize.query(`
        select vp.url as prescriptionUrl,vp.Instructions,vp.analysis,v.speciality,v.status,
        v.consultationMode,v.updatedAt,b.url as billingUrl,u.picUrl,u.firstname,u.lastname 
        from 
        (select * from visitor_appointment where doctorId = ${doctorId}) v
        inner join billing b 
        on v.doctorId = b.doctorId and v.consultationId = b.consultationId
        left join visitor_prescription vp
        on vp.consultationId = v.consultationId
        left join user u 
        on v.visitorId = u.id
        order by v.updatedAt DESC
        limit ${size}
        offset ${(size * page - size)}
        `,{type: sequelize.QueryTypes.SELECT}).then((consultations)=>{
            callback({'consultations': consultations})
        });
    }

    async getAppointmentsByDoctorId(doctorId, page, size, callback) {
        await sequelize.query(`select u.firstname,u.lastname,u.picUrl,v.speciality,v.consultationMode,v.location,v.startTime,v.status from 
        user as u, visitor_appointment as v where v.doctorId = ${doctorId} and 
        v.visitorId = u.id 
        order by startTime desc 
        limit 10`,{type: sequelize.QueryTypes.SELECT}).then((result)=>{
            callback(result);
        })
        //send the required history details to fill the consultation history graph on visitor-dashboard

    }

    async getAppointmentsDetails(visitorAppointments) {
        //for getting the doctor dashboard chart details
        var chartDetails = await this.getChartData(visitorAppointments);
        return chartDetails;
    }

    //get the newConsultations and follow ups
    async getChartData(visitorAppointments) {
        var newConsultations = new Array(9);
        var followUps = new Array(9);
        newConsultations.fill(0);
        followUps.fill(0);
        await visitorAppointments.map((visitorAppointment) => {
            var time;
            time = moment(visitorAppointment.startTime).add({ hours: 5, minutes: 30 }).hours();
            //indexes will be 9am-0, 10am-1, 11am-2, and so on
            if (visitorAppointment.type === 'New Consultation') {
                switch (true) {
                    case (time >= 9 && time < 10):
                        newConsultations[0] = newConsultations[0] + 1;
                        break;
                    case (time >= 10 && time < 11):
                        newConsultations[1] = newConsultations[1] + 1;
                        break;
                    case (time >= 11 && time < 12):
                        newConsultations[2] = newConsultations[2] + 1;
                        break;
                    case (time >= 12 && time < 13):
                        newConsultations[3] = newConsultations[3] + 1;
                        break;
                    case (time >= 13 && time < 14):
                        newConsultations[4] = newConsultations[4] + 1;
                        break;
                    case (time >= 14 && time < 15):
                        newConsultations[5] = newConsultations[5] + 1;
                        break;
                    case (time >= 15 && time < 16):
                        newConsultations[6] = newConsultations[6] + 1;
                        break;
                    case (time >= 16 && time < 17):
                        newConsultations[7] = newConsultations[7] + 1;
                        break;
                    case (time >= 17 && time < 18):
                        newConsultations[8] = newConsultations[8] + 1;
                        break;
                    default:
                        break;
                }
            }
        });
        await visitorAppointments.map((visitorAppointment) => {
            var time;
            time = new Date(visitorAppointment.startTime).getUTCHours();
            //indexes will be 9am-0, 10am-1, 11am-2, and so on
            if (visitorAppointment.type === 'Follow ups') {
                switch (true) {
                    case (time >= 9 && time < 10):
                        followUps[0] = followUps[0] + 1;
                        break;
                    case (time >= 10 && time < 11):
                        followUps[1] = followUps[1] + 1;
                        break;
                    case (time >= 11 && time < 12):
                        followUps[2] = followUps[2] + 1;
                        break;
                    case (time >= 12 && time < 13):
                        followUps[3] = followUps[3] + 1;
                        break;
                    case (time >= 13 && time < 14):
                        followUps[4] = followUps[4] + 1;
                        break;
                    case (time >= 14 && time < 15):
                        followUps[5] = followUps[5] + 1;
                        break;
                    case (time >= 15 && time < 16):
                        followUps[6] = followUps[6] + 1;
                        break;
                    case (time >= 16 && time < 17):
                        followUps[7] = followUps[7] + 1;
                        break;
                    case (time >= 17 && time < 18):
                        followUps[8] = followUps[8] + 1;
                        break;
                    default:
                        break;
                }
            }
        });
        return {
            "newConsultations": newConsultations,
            "followUps": followUps
        };
    }

    updateStore(visitor) {
        if (visitor.language) {
            this.createOrUpdateVisitorStore(visitor, 'Language', visitor.language);
        }
        if (visitor.location) {
            this.createOrUpdateVisitorStore(visitor, 'Location', visitor.location);
        }
    }

    createOrUpdateVisitorStore(visitor, type, value) {
        visitorModel.visitor_store.findAll({
                where: {
                    visitorId: visitor.userId,
                    type: type
                }
            })
            .then((visitorStore) => {
                if (visitorStore.length === 0) {
                    var visitorStore = {
                        visitorId: visitor.userId,
                        type: type,
                        value: value
                    }
                    this.createStore(visitorStore, () => {});
                } else {
                    visitorModel.visitor_store.update({
                        'value': value
                    }, {
                        where: {
                            visitorId: visitor.userId,
                            type: type
                        }
                    }).then(() => {}).catch(error => {
                        log.error('Error while updating visitor: ' + error.stack);
                    });
                }
            }).catch(error => {
                log.error('Error while creating or updating visitor store: ' + error);
            });
    }

    updateVisitorHealth(visitor) {
        this.readByVisitorIdHealth(visitor.userId, (result) => {
            if (result.length === 0) {
                this.createHealth({
                    "visitorId": visitor.userId,
                    "allergies": visitor.allergies,
                    "vitals": {
                        "bloodPressure": visitor.bloodPressure,
                        "heartRate": visitor.heartRate
                    },
                    "createdBy": visitor.userId,
                    "updatedBy": visitor.userId
                }, (createdVisitorHealth) => {
                    log.info('Visitor health entry created for: ', createdVisitorHealth.visitorId);
                });
            } else {
                var visitorHealth = {
                    visitorId: visitor.userId,
                    allergies: visitor.allergies,
                    foodHabits: result[0].foodHabits,
                    vitals: {
                        bloodPressure: visitor.bloodPressure,
                        heartRate: visitor.heartRate
                    }
                }
                visitorModel.visitor_health.update(visitorHealth, {
                    where: {
                        visitorId: visitor.userId
                    }
                }, () => {});
            }
        });
    }
}

export default VisitorService;