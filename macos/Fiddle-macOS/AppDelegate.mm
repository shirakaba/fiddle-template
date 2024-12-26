#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>

#if __has_include(<Fiddle/Fiddle-Swift.h>)
// When use_frameworks! is enabled
#import <Fiddle/Fiddle-Swift.h>
#else
// When use_frameworks! is disabled
#import "Fiddle-Swift.h"
#endif

@implementation AppDelegate {
  EXExpoAppDelegateMacOS *_expoAppDelegate;
}

- (instancetype)init
{
  if (self = [super init]) {
    _expoAppDelegate = [[EXExpoAppDelegateMacOS alloc] init];
  }
  return self;
}

- (void)applicationDidFinishLaunching:(NSNotification *)notification
{
  self.moduleName = @"main";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  
  // Here, we inline the contents of EXAppDelegateWrapper's method `- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions`.
  [super applicationDidFinishLaunching:notification];
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wunused-result"
  [_expoAppDelegate applicationDidFinishLaunching:notification];
#pragma clang diagnostic pop
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

/// This method controls whether the `concurrentRoot`feature of React18 is turned on or off.
///
/// @see: https://reactjs.org/blog/2022/03/29/react-v18.html
/// @note: This requires to be rendering on Fabric (i.e. on the New Architecture).
/// @return: `true` if the `concurrentRoot` feature is enabled. Otherwise, it returns `false`.
- (BOOL)concurrentRootEnabled
{
#ifdef RN_FABRIC_ENABLED
  return true;
#else
  return false;
#endif
}

@end
