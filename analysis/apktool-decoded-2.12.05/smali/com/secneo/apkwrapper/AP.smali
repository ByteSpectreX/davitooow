.class public final Lcom/secneo/apkwrapper/AP;
.super Landroid/app/AppComponentFactory;
.source ""


# annotations
.annotation build Landroid/annotation/TargetApi;
    value = 0x1c
.end annotation


# instance fields
.field private a:Landroid/app/AppComponentFactory;


# direct methods
.method public constructor <init>()V
    .locals 6

    invoke-direct {p0}, Landroid/app/AppComponentFactory;-><init>()V

    const/4 v0, 0x0

    iput-object v0, p0, Lcom/secneo/apkwrapper/AP;->a:Landroid/app/AppComponentFactory;

    return-void
.end method

.method private declared-synchronized a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;
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
    monitor-enter p0

    :try_start_1
    iget-object v0, p0, Lcom/secneo/apkwrapper/AP;->a:Landroid/app/AppComponentFactory;

    if-nez v0, :cond_0

    sget-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    invoke-static {v0}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v0
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    if-nez v0, :cond_0

    :try_start_2
    sget-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    invoke-virtual {p1, v0}, Ljava/lang/ClassLoader;->loadClass(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object p1

    invoke-virtual {p1}, Ljava/lang/Class;->newInstance()Ljava/lang/Object;

    move-result-object p1

    check-cast p1, Landroid/app/AppComponentFactory;

    iput-object p1, p0, Lcom/secneo/apkwrapper/AP;->a:Landroid/app/AppComponentFactory;
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :catch_2
    :cond_0
    :try_start_3
    iget-object p1, p0, Lcom/secneo/apkwrapper/AP;->a:Landroid/app/AppComponentFactory;
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    monitor-exit p0

    return-object p1

    :catchall_0
    move-exception p1

    monitor-exit p0

    throw p1
.end method

.method private static a()Z
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

    invoke-static {}, Landroid/os/Debug;->resetThreadExternalAllocSize()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/AW;->validACF:Ljava/lang/String;

    invoke-static {v0}, Ljava/lang/Boolean;->parseBoolean(Ljava/lang/String;)Z

    move-result v0

    if-eqz v0, :cond_0

    sget-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    const-string v1, "androidx.core.app.CoreComponentFactory"

    invoke-virtual {v1, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_0

    sget-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    const-string v1, "android.app.AppComponentFactory"

    invoke-virtual {v1, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_0

    sget-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    const-string v1, "android.support.v4.app.CoreComponentFactory"

    invoke-virtual {v1, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_0

    const/4 v0, 0x1

    goto :goto_2

    :cond_0
    const/4 v0, 0x0

    :goto_2
    return v0
.end method


# virtual methods
.method public declared-synchronized a(Landroid/app/AppComponentFactory;)V
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
    monitor-enter p0

    :try_start_1
    iput-object p1, p0, Lcom/secneo/apkwrapper/AP;->a:Landroid/app/AppComponentFactory;
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    monitor-exit p0

    return-void

    :catchall_0
    move-exception p1

    monitor-exit p0

    throw p1
.end method

.method public instantiateActivity(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Activity;
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;,
            Ljava/lang/IllegalAccessException;,
            Ljava/lang/InstantiationException;
        }
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalClassInitCount()V

    :goto_1
    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateActivity(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Activity;

    move-result-object p1

    :goto_2
    sget-object p2, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    invoke-virtual {p2}, Landroid/app/Application;->getApplicationContext()Landroid/content/Context;

    move-result-object p2

    invoke-static {p2}, Lcom/secneo/apkwrapper/H;->callBS(Landroid/content/Context;)V

    return-object p1

    :cond_0
    invoke-super {p0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateActivity(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Activity;

    move-result-object p1

    goto :goto_2
.end method

.method public instantiateApplication(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/app/Application;
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;,
            Ljava/lang/IllegalAccessException;,
            Ljava/lang/InstantiationException;
        }
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalFreedCount()V

    :goto_1
    const/4 v0, 0x0

    :try_start_1
    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->is(I)Z

    move-result v0

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    invoke-static {v0}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_2

    :cond_0
    sget-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;
    :try_end_1
    .catch Ljava/lang/Throwable; {:try_start_1 .. :try_end_1} :catch_2

    goto :goto_3

    :catch_2
    :cond_1
    :goto_2
    move-object v0, p2

    :goto_3
    sget v1, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v2, 0x1d

    if-lt v1, v2, :cond_3

    sget-object v1, Lcom/secneo/apkwrapper/AW;->gameCenter:Ljava/lang/String;

    invoke-static {v1}, Ljava/lang/Boolean;->parseBoolean(Ljava/lang/String;)Z

    move-result v1

    if-nez v1, :cond_3

    sget-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    invoke-static {v0}, Landroid/text/TextUtils;->isEmpty(Ljava/lang/CharSequence;)Z

    move-result v0

    if-eqz v0, :cond_2

    move-object v0, p2

    goto :goto_4

    :cond_2
    sget-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    :cond_3
    :goto_4
    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v1

    if-eqz v1, :cond_4

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v1

    invoke-virtual {p0, v1}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v1, :cond_4

    :try_start_2
    invoke-virtual {v1, p1, v0}, Landroid/app/AppComponentFactory;->instantiateApplication(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/app/Application;

    move-result-object v1

    sput-object v1, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_3

    goto :goto_5

    :catch_3
    invoke-super {p0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateApplication(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/app/Application;

    move-result-object v1

    sput-object v1, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    :cond_4
    :goto_5
    sget-object v1, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    if-nez v1, :cond_5

    :try_start_3
    invoke-super {p0, p1, v0}, Landroid/app/AppComponentFactory;->instantiateApplication(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/app/Application;

    move-result-object v0

    sput-object v0, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_4

    goto :goto_6

    :catch_4
    invoke-super {p0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateApplication(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/app/Application;

    move-result-object p1

    sput-object p1, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    :cond_5
    :goto_6
    sget-object p1, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    return-object p1
.end method

.method public instantiateClassLoader(Ljava/lang/ClassLoader;Landroid/content/pm/ApplicationInfo;)Ljava/lang/ClassLoader;
    .locals 6
    .annotation build Landroid/annotation/TargetApi;
        value = 0x1d
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

    invoke-static {}, Landroid/os/Trace;->endSection()V

    :goto_1
    sput-object p2, Lcom/secneo/apkwrapper/H;->sAppInfo:Landroid/content/pm/ApplicationInfo;

    invoke-static {p2}, Lcom/secneo/apkwrapper/H;->load(Landroid/content/pm/ApplicationInfo;)V

    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateClassLoader(Ljava/lang/ClassLoader;Landroid/content/pm/ApplicationInfo;)Ljava/lang/ClassLoader;

    move-result-object p1

    return-object p1

    :cond_0
    invoke-super {p0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateClassLoader(Ljava/lang/ClassLoader;Landroid/content/pm/ApplicationInfo;)Ljava/lang/ClassLoader;

    move-result-object p1

    return-object p1
.end method

.method public instantiateProvider(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/content/ContentProvider;
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;,
            Ljava/lang/IllegalAccessException;,
            Ljava/lang/InstantiationException;
        }
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

    invoke-static {}, Landroid/os/Debug;->resetThreadGcInvocationCount()V

    :goto_1
    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateProvider(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/content/ContentProvider;

    move-result-object p1

    return-object p1

    :cond_0
    invoke-super {p0, p1, p2}, Landroid/app/AppComponentFactory;->instantiateProvider(Ljava/lang/ClassLoader;Ljava/lang/String;)Landroid/content/ContentProvider;

    move-result-object p1

    return-object p1
.end method

.method public instantiateReceiver(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/content/BroadcastReceiver;
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;,
            Ljava/lang/IllegalAccessException;,
            Ljava/lang/InstantiationException;
        }
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
    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateReceiver(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/content/BroadcastReceiver;

    move-result-object p1

    return-object p1

    :cond_0
    invoke-super {p0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateReceiver(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/content/BroadcastReceiver;

    move-result-object p1

    return-object p1
.end method

.method public instantiateService(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Service;
    .locals 6
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/ClassNotFoundException;,
            Ljava/lang/IllegalAccessException;,
            Ljava/lang/InstantiationException;
        }
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

    invoke-static {}, Landroid/os/Debug;->resetThreadExternalAllocCount()V

    :goto_1
    invoke-static {}, Lcom/secneo/apkwrapper/AP;->a()Z

    move-result v0

    if-eqz v0, :cond_0

    invoke-direct {p0, p1}, Lcom/secneo/apkwrapper/AP;->a(Ljava/lang/ClassLoader;)Landroid/app/AppComponentFactory;

    move-result-object v0

    invoke-virtual {p0, v0}, Lcom/secneo/apkwrapper/AP;->a(Landroid/app/AppComponentFactory;)V

    if-eqz v0, :cond_0

    invoke-virtual {v0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateService(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Service;

    move-result-object p1

    return-object p1

    :cond_0
    invoke-super {p0, p1, p2, p3}, Landroid/app/AppComponentFactory;->instantiateService(Ljava/lang/ClassLoader;Ljava/lang/String;Landroid/content/Intent;)Landroid/app/Service;

    move-result-object p1

    return-object p1
.end method
