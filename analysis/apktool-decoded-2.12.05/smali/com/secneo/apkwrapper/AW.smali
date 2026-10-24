.class public Lcom/secneo/apkwrapper/AW;
.super Landroid/app/Application;
.source ""


# static fields
.field public static gameCenter:Ljava/lang/String; = "false"

.field private static mBootStrapApplication:Landroid/app/Application; = null

.field private static realApplication:Landroid/app/Application; = null

.field public static validACF:Ljava/lang/String; = "true"


# direct methods
.method static constructor <clinit>()V
    .locals 6

    return-void
.end method

.method public constructor <init>()V
    .locals 6

    invoke-direct {p0}, Landroid/app/Application;-><init>()V

    return-void
.end method

.method private static currentActivityThread()Ljava/lang/Object;
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Looper;->prepare()V

    :goto_1
    const-string v0, "android.app.ActivityThread"

    const/4 v1, 0x0

    :try_start_1
    invoke-static {v0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object v0

    const-string v2, "currentActivityThread"

    const/4 v3, 0x0

    new-array v4, v3, [Ljava/lang/Class;

    invoke-virtual {v0, v2, v4}, Ljava/lang/Class;->getDeclaredMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object v0

    const/4 v2, 0x1

    invoke-virtual {v0, v2}, Ljava/lang/reflect/Method;->setAccessible(Z)V

    new-array v2, v3, [Ljava/lang/Object;

    invoke-virtual {v0, v1, v2}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object v0
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    return-object v0

    :catch_2
    return-object v1
.end method

.method public static doAttach(Landroid/app/Application;Ljava/lang/String;)V
    .locals 7

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetThreadAllocCount()V

    :goto_1
    const/4 v0, 0x0

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->is(I)Z

    move-result v1

    if-nez v1, :cond_2

    invoke-static {p1}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v1

    if-nez v1, :cond_2

    sget-object v1, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    invoke-virtual {v1, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_0

    goto :goto_2

    :cond_0
    :try_start_1
    invoke-virtual {p0}, Landroid/app/Application;->getBaseContext()Landroid/content/Context;

    move-result-object v1

    invoke-virtual {p0}, Landroid/app/Application;->getClassLoader()Ljava/lang/ClassLoader;

    move-result-object p0

    invoke-virtual {p0, p1}, Ljava/lang/ClassLoader;->loadClass(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object p0

    sget-object p1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-nez p1, :cond_1

    invoke-virtual {p0}, Ljava/lang/Class;->newInstance()Ljava/lang/Object;

    move-result-object p0

    check-cast p0, Landroid/app/Application;

    sput-object p0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    :cond_1
    const-class p0, Landroid/app/Application;

    sget-object p1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    const/4 v2, 0x1

    new-array v3, v2, [Ljava/lang/Object;

    aput-object v1, v3, v0

    const-string v4, "attach"

    new-array v5, v2, [Ljava/lang/Class;

    const-class v6, Landroid/content/Context;

    aput-object v6, v5, v0

    invoke-static {p0, p1, v3, v4, v5}, Lcom/secneo/apkwrapper/H;->invokeMethod(Ljava/lang/Class;Ljava/lang/Object;[Ljava/lang/Object;Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/Object;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object p0

    new-array p1, v2, [Ljava/lang/Object;

    sget-object v3, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    aput-object v3, p1, v0

    const-string v3, "setOuterContext"

    new-array v2, v2, [Ljava/lang/Class;

    const-class v4, Landroid/content/Context;

    aput-object v4, v2, v0

    invoke-static {p0, v1, p1, v3, v2}, Lcom/secneo/apkwrapper/H;->invokeMethod(Ljava/lang/Class;Ljava/lang/Object;[Ljava/lang/Object;Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/Object;
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    :catch_2
    :cond_2
    :goto_2
    return-void
.end method

.method private static native hn(Landroid/content/Context;Landroid/app/Application;)V
.end method

.method public static hook(Landroid/app/Application;Ljava/lang/String;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetAllCounts()V

    :goto_1
    const/4 v0, 0x0

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->is(I)Z

    move-result v0

    if-nez v0, :cond_2

    invoke-static {p1}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v0

    if-nez v0, :cond_2

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    invoke-virtual {v0, p1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    :try_start_1
    invoke-virtual {p0}, Landroid/app/Application;->getBaseContext()Landroid/content/Context;

    move-result-object v0

    invoke-virtual {p0}, Landroid/app/Application;->getClassLoader()Ljava/lang/ClassLoader;

    move-result-object v1

    invoke-virtual {v1, p1}, Ljava/lang/ClassLoader;->loadClass(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object p1

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-nez v1, :cond_1

    invoke-virtual {p1}, Ljava/lang/Class;->newInstance()Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/app/Application;

    sput-object p1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    :cond_1
    invoke-static {v0, p0}, Lcom/secneo/apkwrapper/AW;->hn(Landroid/content/Context;Landroid/app/Application;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    :catch_2
    :cond_2
    :goto_2
    return-void
.end method

.method public static patchProvider()V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalExternalFreedCount()V

    :goto_1
    const-string v0, "mApplication"

    const-string v1, "android.app.LoadedApk"

    sget-object v2, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v2, :cond_2

    sget-object v2, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v3, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v3}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v2

    if-eqz v2, :cond_0

    goto :goto_2

    :cond_0
    :try_start_1
    sget-object v2, Lcom/secneo/apkwrapper/AW;->mBootStrapApplication:Landroid/app/Application;

    invoke-virtual {v2}, Landroid/app/Application;->getBaseContext()Landroid/content/Context;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v3

    const-string v4, "mPackageInfo"

    invoke-static {v3, v2, v4}, Lcom/secneo/apkwrapper/H;->getFieldValue(Ljava/lang/Class;Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v2

    invoke-static {v1, v2, v0}, Lcom/secneo/apkwrapper/H;->getFieldValue(Ljava/lang/String;Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/Object;

    move-result-object v3

    instance-of v3, v3, Lcom/secneo/apkwrapper/AW;

    if-eqz v3, :cond_1

    sget-object v3, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-static {v1, v2, v0, v3}, Lcom/secneo/apkwrapper/H;->setFieldValue(Ljava/lang/String;Ljava/lang/Object;Ljava/lang/String;Ljava/lang/Object;)Z

    :cond_1
    invoke-static {}, Lcom/secneo/apkwrapper/AW;->pn()V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    goto :goto_2

    :catch_2
    move-exception v0

    invoke-virtual {v0}, Ljava/lang/Exception;->printStackTrace()V

    :cond_2
    :goto_2
    return-void
.end method

.method public static native pn()V
.end method

.method public static replaceApplicationContext(Landroid/app/Application;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalClassInitTime()V

    :goto_1
    const/4 p0, 0x0

    invoke-static {p0}, Lcom/secneo/apkwrapper/H;->is(I)Z

    move-result p0

    if-nez p0, :cond_1

    sget-object p0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz p0, :cond_1

    sget-object p0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result p0

    if-eqz p0, :cond_0

    goto :goto_2

    :cond_0
    :try_start_1
    sget-object p0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {p0}, Landroid/app/Application;->onCreate()V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    goto :goto_2

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/Exception;->printStackTrace()V

    :cond_1
    :goto_2
    return-void
.end method


# virtual methods
.method protected attachBaseContext(Landroid/content/Context;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalAllocSize()V

    :goto_1
    sput-object p0, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    invoke-virtual {p1}, Landroid/content/Context;->getApplicationInfo()Landroid/content/pm/ApplicationInfo;

    move-result-object v0

    sput-object v0, Lcom/secneo/apkwrapper/H;->sAppInfo:Landroid/content/pm/ApplicationInfo;

    sget-object v0, Lcom/secneo/apkwrapper/H;->sAppInfo:Landroid/content/pm/ApplicationInfo;

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->load(Landroid/content/pm/ApplicationInfo;)V

    sput-object p0, Lcom/secneo/apkwrapper/AW;->mBootStrapApplication:Landroid/app/Application;

    invoke-super {p0, p1}, Landroid/app/Application;->attachBaseContext(Landroid/content/Context;)V

    sget-object p1, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    invoke-static {p0, p1}, Lcom/secneo/apkwrapper/AW;->doAttach(Landroid/app/Application;Ljava/lang/String;)V

    return-void
.end method

.method public getApplicationContext()Landroid/content/Context;
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Trace;->endSection()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_0

    return-object v0

    :cond_0
    invoke-super {p0}, Landroid/app/Application;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    return-object v0
.end method

.method public getAssets()Landroid/content/res/AssetManager;
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Looper;->loop()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0}, Landroid/app/Application;->getAssets()Landroid/content/res/AssetManager;

    move-result-object v0

    return-object v0

    :cond_1
    :goto_2
    invoke-super {p0}, Landroid/app/Application;->getAssets()Landroid/content/res/AssetManager;

    move-result-object v0

    return-object v0
.end method

.method public getResources()Landroid/content/res/Resources;
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetThreadAllocCount()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0}, Landroid/app/Application;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    return-object v0

    :cond_1
    :goto_2
    invoke-super {p0}, Landroid/app/Application;->getResources()Landroid/content/res/Resources;

    move-result-object v0

    return-object v0
.end method

.method public getTheme()Landroid/content/res/Resources$Theme;
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalClassInitCount()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0}, Landroid/app/Application;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v0

    return-object v0

    :cond_1
    :goto_2
    invoke-super {p0}, Landroid/app/Application;->getTheme()Landroid/content/res/Resources$Theme;

    move-result-object v0

    return-object v0
.end method

.method public onConfigurationChanged(Landroid/content/res/Configuration;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalAllocCount()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0, p1}, Landroid/app/Application;->onConfigurationChanged(Landroid/content/res/Configuration;)V

    return-void

    :cond_1
    :goto_2
    invoke-super {p0, p1}, Landroid/app/Application;->onConfigurationChanged(Landroid/content/res/Configuration;)V

    return-void
.end method

.method public onCreate()V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->stopMethodTracing()V

    :goto_1
    invoke-super {p0}, Landroid/app/Application;->onCreate()V

    sget-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    invoke-static {p0, v0}, Lcom/secneo/apkwrapper/AW;->hook(Landroid/app/Application;Ljava/lang/String;)V

    invoke-static {p0}, Lcom/secneo/apkwrapper/AW;->replaceApplicationContext(Landroid/app/Application;)V

    invoke-virtual {p0}, Lcom/secneo/apkwrapper/AW;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->callBS(Landroid/content/Context;)V

    return-void
.end method

.method public registerActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V
    .locals 6
    .annotation build Landroid/annotation/TargetApi;
        value = 0xe
    .end annotation

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetGlobalExternalAllocSize()V

    :goto_1
    invoke-super {p0, p1}, Landroid/app/Application;->registerActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V

    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    invoke-virtual {v0, p1}, Landroid/app/Application;->registerActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V

    :cond_1
    :goto_2
    return-void
.end method

.method public registerComponentCallbacks(Landroid/content/ComponentCallbacks;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Ljunit/framework/Assert;->fail()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0, p1}, Landroid/app/Application;->registerComponentCallbacks(Landroid/content/ComponentCallbacks;)V

    return-void

    :cond_1
    :goto_2
    invoke-super {p0, p1}, Landroid/app/Application;->registerComponentCallbacks(Landroid/content/ComponentCallbacks;)V

    return-void
.end method

.method public unregisterActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Debug;->resetThreadAllocSize()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0, p1}, Landroid/app/Application;->unregisterActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V

    return-void

    :cond_1
    :goto_2
    invoke-super {p0, p1}, Landroid/app/Application;->unregisterActivityLifecycleCallbacks(Landroid/app/Application$ActivityLifecycleCallbacks;)V

    return-void
.end method

.method public unregisterComponentCallbacks(Landroid/content/ComponentCallbacks;)V
    .locals 6

    const/4 v0, 0x0

    :try_start_0
    new-array v0, v0, [I
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1
    .catch Ljava/lang/Throwable; {:try_start_0 .. :try_end_0} :catch_0

    nop

    goto :goto_0

    :catch_0
    move-exception v0

    .local v0, "ex1":Ljava/lang/Throwable;
    throw v0

    .end local v0    # "ex1":Ljava/lang/Throwable;
    :catch_1
    move-exception v0

    .local v0, "ex1":Ljava/lang/Exception;
    throw v0

    :goto_0
    goto :goto_1

    invoke-static {}, Landroid/os/Looper;->loop()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    sget-object v1, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v1}, Ljava/lang/Object;->getClass()Ljava/lang/Class;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Class;->getName()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/AW;->realApplication:Landroid/app/Application;

    invoke-virtual {v0, p1}, Landroid/app/Application;->unregisterComponentCallbacks(Landroid/content/ComponentCallbacks;)V

    return-void

    :cond_1
    :goto_2
    invoke-super {p0, p1}, Landroid/app/Application;->unregisterComponentCallbacks(Landroid/content/ComponentCallbacks;)V

    return-void
.end method
