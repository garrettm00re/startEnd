import SwiftUI
import UserNotifications

struct ContentView: View {
    @State private var wakeUpTime = Date()
    @State private var bedTime = Date()
    @State private var tasks: [Task] = []
    @State private var currentTask: String = ""
    @State private var showingTaskAlert = false
    
    var body: some View {
        HStack {
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
            }
            
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
                Button(action: {
                    showingTaskAlert = true
                }) {
                    Text("Start/End Task")
                        .font(.largeTitle)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .alert(isPresented: $showingTaskAlert) {
                    Alert(
                        title: Text("New Task"),
                        message: Text("Enter the name of the task"),
                        primaryButton: .default(Text("Add Task"), action: {
                            addTask()
                        }),
                        secondaryButton: .cancel()
                    )
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
    
    func addTask() {
        if !currentTask.isEmpty {
            let newTask = Task(name: currentTask, startTime: Date())
            tasks.append(newTask)
            currentTask = ""
        }
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

