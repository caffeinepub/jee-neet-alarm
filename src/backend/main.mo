import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";

actor {
  type Alarm = {
    id : Nat;
    timeHours : Nat;
    timeMinutes : Nat;
    alarmLabel : Text;
    subject : Text;
    enabled : Bool;
  };

  type Question = {
    id : Nat;
    questionText : Text;
    options : [Text];
    correctIndex : Nat;
    subject : Text;
    topic : Text;
  };

  type DismissRecord = {
    alarmId : Nat;
    attempts : Nat;
  };

  let alarms = Map.empty<Nat, Alarm>();
  let dismissRecords = Map.empty<Time.Time, DismissRecord>();

  var questions : [Question] = [
    // JEE Physics
    {
      id = 1;
      questionText = "What is the SI unit of force?";
      options = ["Newton", "Joule", "Pascal", "Watt"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Physics";
    },
    {
      id = 2;
      questionText = "What is the speed of light?";
      options = ["3x10^8 m/s", "3x10^6 m/s", "3x10^7 m/s", "3x10^5 m/s"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Physics";
    },
    // JEE Chemistry
    {
      id = 3;
      questionText = "What is the chemical symbol for gold?";
      options = ["Au", "Ag", "Pt", "Pb"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Chemistry";
    },
    {
      id = 4;
      questionText = "What is the pH of neutral water?";
      options = ["7", "5", "9", "6"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Chemistry";
    },
    // JEE Math
    {
      id = 5;
      questionText = "What is the derivative of x^2?";
      options = ["2x", "x", "x^2", "1"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Math";
    },
    {
      id = 6;
      questionText = "What is the value of pi?";
      options = ["3.14", "2.14", "4.14", "1.14"];
      correctIndex = 0;
      subject = "JEE";
      topic = "Math";
    },
    // NEET Biology
    {
      id = 7;
      questionText = "What is the powerhouse of the cell?";
      options = ["Mitochondria", "Nucleus", "Ribosome", "Chloroplast"];
      correctIndex = 0;
      subject = "NEET";
      topic = "Biology";
    },
    {
      id = 8;
      questionText = "What is the largest organ in the human body?";
      options = ["Skin", "Liver", "Heart", "Brain"];
      correctIndex = 0;
      subject = "NEET";
      topic = "Biology";
    },
    {
      id = 9;
      questionText = "What is the function of red blood cells?";
      options = ["Carry oxygen", "Fight infection", "Clot blood", "Digest food"];
      correctIndex = 0;
      subject = "NEET";
      topic = "Biology";
    },
    // Mixed Questions
    {
      id = 10;
      questionText = "What is the value of gravitational acceleration on Earth?";
      options = ["9.8 m/s^2", "8.9 m/s^2", "9.8 km/s^2", "8.9 km/s^2"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Physics";
    },
    {
      id = 11;
      questionText = "What is the symbol for sodium in chemistry?";
      options = ["Na", "K", "S", "Ca"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Chemistry";
    },
    {
      id = 12;
      questionText = "What is the formula for the area of a circle?";
      options = ["pi*r^2", "2*pi*r", "pi*r", "2*r"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Math";
    },
    {
      id = 13;
      questionText = "What is the process by which plants make food?";
      options = ["Photosynthesis", "Respiration", "Fermentation", "Transpiration"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Biology";
    },
    {
      id = 14;
      questionText = "What is the boiling point of water at sea level?";
      options = ["100°C", "0°C", "50°C", "25°C"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Chemistry/Physics";
    },
    {
      id = 15;
      questionText = "What is sin(90°)?";
      options = ["1", "0", "-1", "0.5"];
      correctIndex = 0;
      subject = "Mixed";
      topic = "Math";
    },
  ];

  var nextAlarmId = 1;

  public shared ({ caller }) func createAlarm(timeHours : Nat, timeMinutes : Nat, alarmLabel : Text, subject : Text) : async Nat {
    let newId = nextAlarmId;
    nextAlarmId += 1;

    let alarm : Alarm = {
      id = newId;
      timeHours;
      timeMinutes;
      alarmLabel;
      subject;
      enabled = true;
    };

    alarms.add(newId, alarm);
    newId;
  };

  public shared ({ caller }) func updateAlarm(id : Nat, timeHours : Nat, timeMinutes : Nat, alarmLabel : Text, subject : Text, enabled : Bool) : async () {
    if (not alarms.containsKey(id)) { Runtime.trap("Alarm not found") };

    let updatedAlarm : Alarm = {
      id;
      timeHours;
      timeMinutes;
      alarmLabel;
      subject;
      enabled;
    };

    alarms.add(id, updatedAlarm);
  };

  public shared ({ caller }) func deleteAlarm(id : Nat) : async () {
    if (not alarms.containsKey(id)) { Runtime.trap("Alarm not found") };
    alarms.remove(id);
  };

  public query ({ caller }) func listAlarms() : async [Alarm] {
    alarms.values().toArray();
  };

  func getRandomQuestionBySubject(subject : Text) : ?Question {
    let filtered = questions.filter(func(q) { q.subject == subject or subject == "Mixed" });
    if (filtered.size() == 0) { return null };
    let seed = Int.abs(Time.now());
    let index = seed % filtered.size();
    ?filtered[index];
  };

  public query ({ caller }) func getRandomQuestion(subject : Text) : async ?Question {
    getRandomQuestionBySubject(subject);
  };

  public shared ({ caller }) func recordDismiss(alarmId : Nat, attempts : Nat) : async () {
    if (not alarms.containsKey(alarmId)) { Runtime.trap("Alarm not found") };
    let record : DismissRecord = {
      alarmId;
      attempts;
    };
    dismissRecords.add(Time.now(), record);
  };

  public query ({ caller }) func getStats() : async (Nat, Float) {
    let totalDismissed = dismissRecords.size();
    if (totalDismissed == 0) { return (0, 0.0) };

    let sumAttempts = dismissRecords.values().toArray().foldLeft(0, func(acc, record) { acc + record.attempts });
    let avgAttempts = sumAttempts.toFloat() / totalDismissed.toFloat();

    (totalDismissed, avgAttempts);
  };
};
