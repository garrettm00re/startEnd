import SwiftUI
import UserNotifications

struct ContentView: View {
    @State private var wakeUpTime = Date()
    @State private var bedTime = Date()
    @State private var tasks: [Task] = []
    @State private var currentTask: String = ""
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Settings")) {
                    DatePicker("Wake Up Time", selection: $wakeUpTime, displayedComponents: .hourAndMinute)
                    DatePicker("Bed Time", selection: $bedTime, displayedComponents: .hourAndMinute)
                    Button("Schedule Notifications") {
                        scheduleNotifications()
                    }
                }
            }
            .listStyle(SidebarListStyle())
            .navigationBarTitle("Wake Up Bed Time App")
            
            VStack {
                ScrollView {
                    VStack(alignment: .leading) {
                        ForEach(tasks) { task in
                            VStack(alignment: .leading) {
                                Text(task.name)
                                Text("Started at: \(task.startTime)")
                            }
                            .padding()
                        }
                    }
                }
                Spacer()
                Button(action: startEndTask) {
                    Text("Start/End Task")
                        .font(.largeTitle)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                Spacer()
            }
            .padding()
        }
    }
    
    func scheduleNotifications() {
        let center = UNUserNotificationCenter.current()
        center.requestAuthorization(options: [.alert, .sound]) { granted, error in
            if granted {
                let wakeUpContent = UNMutableNotificationContent()
                wakeUpContent.title = "Wake Up!"
                wakeUpContent.body = "It's time to wake up!"
                let wakeUpTrigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.hour, .minute], from: wakeUpTime), repeats: true)
                let wakeUpRequest = UNNotificationRequest(identifier: "wakeUp", content: wakeUpContent, trigger: wakeUpTrigger)
                
                let bedTimeContent = UNMutableNotificationContent()
                bedTimeContent.title = "Bed Time!"
                bedTimeContent.body = "It's time to go to bed!"
                let bedTimeTrigger = UNCalendarNotificationTrigger(dateMatching: Calendar.current.dateComponents([.hour, .minute], from: bedTime), repeats: true)
                let bedTimeRequest = UNNotificationRequest(identifier: "bedTime", content: bedTimeContent, trigger: bedTimeTrigger)
                
                center.add(wakeUpRequest)
                center.add(bedTimeRequest)
            }
        }
    }
    
    func startEndTask() {
        let newTask = Task(name: "Task at \(DateFormatter.localizedString(from: Date(), dateStyle: .short, timeStyle: .short))", startTime: Date())
        tasks.append(newTask)
    }
}

struct Task: Identifiable {
    let id = UUID()
    let name: String
    let startTime: Date
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

