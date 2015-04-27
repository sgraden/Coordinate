
-- Create User
CREATE PROCEDURE `sp_new_user` (
	IN p_PValue VARCHAR(200),
	IN p_SValue VARCHAR(200),
	IN p_UserFName VARCHAR(60),
	IN p_UserLName VARCHAR(60),
	IN p_UserEmail VARCHAR(60),
	IN p_UserBirthDate DATE,
	IN p_UserGender VARCHAR(5),
	IN p_FullAccount BIT(1)
)
BEGIN
	DECLARE PID INT;
    DECLARE SID INT;
        
	INSERT INTO tblP (`PValue`) VALUES (p_PValue);
	SET PID = (SELECT LAST_INSERT_ID());
	INSERT INTO tblS (SValue) VALUES (p_SValue);
	SET SID = (SELECT LAST_INSERT_ID());
	
	SELECT PID;

	INSERT INTO tbluser (pid, sid, userfname, userlname, useremail, userbirthdate, usergender, fullaccount)
    VALUES(PID, SID, UserFName, UserLName, UserEmail, UserBirthDate, UserGender, FullAccount);
END

-- Create Event
CREATE PROCEDURE `sp_create_event`(
	pEventName VARCHAR(80),
	pEventDesc VARCHAR(500),
	pEventCreatorID INT,
	pEventStartDate DATE,
	pEventEndDate DATE,
	pEventLength INT,
	pEventStartTime TIME,
	pEventEndTime TIME,
	pNotifyNumParticipant INT,
	pNotifyDays INT,
	pNotifyEachParticipant BIT(1),
	pEventUUID VARCHAR(100)
)
BEGIN

INSERT INTO tblEVENT (EventName, EventDesc, EventCreatorID, EventStartDate,EventEndDate,
	EventLength, EventStartTime, EventEndTime, NotifyNumParticipant,
    NotifyDays, NotifyEachParticipant, EventUUID)
VALUES (pEventName, pEventDesc, pEventCreatorID, pEventStartDate,pEventEndDate, pEventLength,
	pEventStartTime, pEventEndTime, pNotifyNumParticipant,
    pNotifyDays, pNotifyEachParticipant, pEventUUID);

END