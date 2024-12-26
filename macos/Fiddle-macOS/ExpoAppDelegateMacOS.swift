import ExpoModulesCore
import Dispatch
import Foundation

var subscribers = [ExpoAppDelegateSubscriberProtocol]()
var reactDelegateHandlers = [ExpoReactDelegateHandler]()

/**
 Based on expo-modules-core/ios/AppDelegates/ExpoAppDelegate.swift.
 
 Allows classes extending `ExpoAppDelegateSubscriber` to hook into project's app delegate
 by forwarding `NSApplicationDelegate` events to the subscribers.

 Keep functions and markers in sync with https://developer.apple.com/documentation/appkit/nsapplicationdelegate
 */
@objc(EXExpoAppDelegateMacOS)
open class ExpoAppDelegateMacOS: NSResponder, NSApplicationDelegate {
  open var window: NSWindow?

  @objc
  public let reactDelegate = ExpoReactDelegate(handlers: reactDelegateHandlers)
  
  public func applicationDidFinishLaunching(_ notification: Notification) {
      subscribers.forEach { subscriber in
          subscriber.applicationDidFinishLaunching?(notification)
      }
  }

  public func applicationWillFinishLaunching(_ notification: Notification) {
      let parsedSubscribers = subscribers.filter {
          $0.responds(to: #selector(applicationWillFinishLaunching(_:)))
      }

      parsedSubscribers.forEach { subscriber in
          subscriber.applicationWillFinishLaunching?(notification)
      }
  }

  public func applicationDidBecomeActive(_ notification: Notification) {
      subscribers.forEach { $0.applicationDidBecomeActive?(notification) }
  }

  public func applicationWillResignActive(_ notification: Notification) {
      subscribers.forEach { $0.applicationWillResignActive?(notification) }
  }

  public func applicationWillTerminate(_ notification: Notification) {
      subscribers.forEach { $0.applicationWillTerminate?(notification) }
  }

  @objc public func customizeRootView(_ rootView: NSView) {
    subscribers.forEach { $0.customizeRootView?(rootView) }
  }

  public func application(_ application: NSApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
      subscribers.forEach { $0.application?(application, didRegisterForRemoteNotificationsWithDeviceToken: deviceToken) }
  }

  public func application(_ application: NSApplication, didFailToRegisterForRemoteNotificationsWithError error: any Error) {
      subscribers.forEach { $0.application?(application, didFailToRegisterForRemoteNotificationsWithError: error) }
  }

  // MARK: - Statics

  @objc
  public static func registerSubscribersFrom(modulesProvider: ModulesProvider) {
    modulesProvider.getAppDelegateSubscribers().forEach { subscriberType in
      registerSubscriber(subscriberType.init())
    }
  }

  @objc
  public static func registerSubscriber(_ subscriber: ExpoAppDelegateSubscriberProtocol) {
    if subscribers.contains(where: { $0 === subscriber }) {
      fatalError("Given app delegate subscriber `\(String(describing: subscriber))` is already registered.")
    }
    subscribers.append(subscriber)
  }

  @objc
  public static func getSubscriber(_ name: String) -> ExpoAppDelegateSubscriberProtocol? {
    return subscribers.first { String(describing: $0) == name }
  }

  public static func getSubscriberOfType<Subscriber>(_ type: Subscriber.Type) -> Subscriber? {
    return subscribers.first { $0 is Subscriber } as? Subscriber
  }

  @objc
  public static func registerReactDelegateHandlersFrom(modulesProvider: ModulesProvider) {
    // TODO: support sorting by priority
    modulesProvider.getReactDelegateHandlers()
      // .sorted { tuple1, tuple2 -> Bool in
      //   return ModulePriorities.get(tuple1.packageName) > ModulePriorities.get(tuple2.packageName)
      // }
      .forEach { handlerTuple in
        reactDelegateHandlers.append(handlerTuple.handler.init())
      }
  }
}
