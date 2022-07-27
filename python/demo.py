import properform.memory_leak as memleak
import weakref
memleak.start()

class Monitor(object):
    def __init__(self):
        self.observer = []  # 保存所有观察对象
    def attach(self, observer):
        self.observer.append(observer)

class StudentObserver(object):
    def __init__(self, monitor):
        self.monitor = monitor  # 绑定通知者
    
def x():
    monitor = Monitor()
    observer1 = StudentObserver(monitor)
    observer2 = StudentObserver(monitor)
    monitor.attach(observer1)
    monitor.attach(observer2)
x()

mleak = memleak.collect()

import codecs, json
with codecs.open('demo_properform.json', 'w') as f:
	json.dump(mleak, f)
