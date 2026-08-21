"""
Test Messaging system end-to-end based on Phase 1 Requirements.
"""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.models.enums import Role
from app.services.message_service import message_service
from app.schemas.conversation_schema import MessageCreate

def main():
    db = SessionLocal()
    
    try:
        # 0. Get users
        demo_student = db.query(User).filter(User.email == "student@gmail.com").first()
        demo_faculty = db.query(User).filter(User.email == "faculty@gmail.com").first()
        jane_faculty = db.query(User).filter(User.email == "faculty@test.com").first()
        
        assert demo_student is not None
        assert demo_faculty is not None
        assert jane_faculty is not None
        
        print("1. Users loaded.")
        
        # 1. available-faculty should only return Demo Faculty
        avail = message_service.get_faculty_list(db)
        assert len(avail) == 1, f"Expected 1 available faculty, got {len(avail)}"
        assert avail[0]["id"] == demo_faculty.id, "Available faculty is not Demo Faculty"
        print("2. get_available_faculty returns ONLY Demo Faculty -> PASS")
        
        # Cleanup existing convs for a clean test
        db.query(Conversation).delete()
        db.commit()
        
        # 2. Student creates/finds conversation
        conv = message_service.get_or_create_conversation(db, demo_student, faculty_id=demo_faculty.id)
        assert conv.id > 0
        print("3. Conversation created -> PASS")
        
        # Idempotency check
        conv2 = message_service.get_or_create_conversation(db, demo_student, faculty_id=demo_faculty.id)
        assert conv2.id == conv.id
        print("4. Idempotent conversation creation -> PASS")
        
        # 3. Student sends message
        msg_payload = MessageCreate(content="Sir, I have a doubt regarding DBMS.")
        sent_msg = message_service.send_message(db, conv.id, demo_student, msg_payload)
        
        # 4. Message stored
        db_msg = db.query(Message).filter(Message.id == sent_msg.id).first()
        assert db_msg is not None
        assert db_msg.sender_id == demo_student.id
        assert db_msg.sender_role == Role.STUDENT
        assert db_msg.content == "Sir, I have a doubt regarding DBMS."
        print("5. Student message sent and stored -> PASS")
        
        # 5. Faculty reads conversation
        read_res = message_service.mark_as_read(db, conv.id, demo_faculty)
        assert read_res["marked_read"] == 1
        db.refresh(db_msg)
        assert db_msg.is_read == True
        print("6. Faculty reads message and it is marked read -> PASS")
        
        # 6. Faculty replies
        reply_payload = MessageCreate(content="Sure. Tell me your doubt.")
        reply_msg = message_service.send_message(db, conv.id, demo_faculty, reply_payload)
        
        db_reply = db.query(Message).filter(Message.id == reply_msg.id).first()
        assert db_reply is not None
        assert db_reply.sender_id == demo_faculty.id
        assert db_reply.sender_role == Role.FACULTY
        assert db_reply.content == "Sure. Tell me your doubt."
        print("7. Faculty reply sent and stored -> PASS")
        
        # 7. Auth check (Jane trying to access)
        try:
            message_service.get_conversation_detail(db, conv.id, jane_faculty)
            assert False, "Jane Faculty was able to access Demo Student's conversation!"
        except Exception as e:
            assert "Access denied" in str(e)
            print("8. Unauthorized faculty access blocked -> PASS")
        
        print("\nALL BACKEND MESSAGE TESTS PASSED \u2705")
        
    finally:
        db.close()

if __name__ == "__main__":
    main()
