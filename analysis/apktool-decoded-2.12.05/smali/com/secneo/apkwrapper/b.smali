.class final Lcom/secneo/apkwrapper/b;
.super Ljava/lang/Object;
.source ""

# interfaces
.implements Landroid/content/ServiceConnection;


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/secneo/apkwrapper/H;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x8
    name = null
.end annotation


# direct methods
.method constructor <init>()V
    .locals 6

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method


# virtual methods
.method public onServiceConnected(Landroid/content/ComponentName;Landroid/os/IBinder;)V
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalFreedSize()V

    :goto_1
    :try_start_1
    invoke-static {}, Lcom/secneo/apkwrapper/H;->access$100()Landroid/os/Messenger;

    move-result-object p1

    if-nez p1, :cond_0

    new-instance p1, Landroid/os/Messenger;

    new-instance v0, Lcom/secneo/apkwrapper/H$a;

    invoke-direct {v0}, Lcom/secneo/apkwrapper/H$a;-><init>()V

    invoke-direct {p1, v0}, Landroid/os/Messenger;-><init>(Landroid/os/Handler;)V

    invoke-static {p1}, Lcom/secneo/apkwrapper/H;->access$102(Landroid/os/Messenger;)Landroid/os/Messenger;

    :cond_0
    invoke-static {}, Lcom/secneo/apkwrapper/H;->access$200()Landroid/os/Messenger;

    move-result-object p1

    if-nez p1, :cond_1

    new-instance p1, Landroid/os/Messenger;

    invoke-direct {p1, p2}, Landroid/os/Messenger;-><init>(Landroid/os/IBinder;)V

    invoke-static {p1}, Lcom/secneo/apkwrapper/H;->access$202(Landroid/os/Messenger;)Landroid/os/Messenger;

    :cond_1
    const/4 p1, 0x0

    const/16 p2, 0x3e8

    invoke-static {p1, p2}, Landroid/os/Message;->obtain(Landroid/os/Handler;I)Landroid/os/Message;

    move-result-object p1

    invoke-static {}, Landroid/os/Process;->myPid()I

    move-result p2

    iput p2, p1, Landroid/os/Message;->arg1:I

    invoke-static {}, Lcom/secneo/apkwrapper/H;->access$100()Landroid/os/Messenger;

    move-result-object p2

    iput-object p2, p1, Landroid/os/Message;->replyTo:Landroid/os/Messenger;

    invoke-static {}, Lcom/secneo/apkwrapper/H;->access$200()Landroid/os/Messenger;

    move-result-object p2

    invoke-virtual {p2, p1}, Landroid/os/Messenger;->send(Landroid/os/Message;)V
    :try_end_1
    .catch Landroid/os/RemoteException; {:try_start_1 .. :try_end_1} :catch_2

    :catch_2
    return-void
.end method

.method public onServiceDisconnected(Landroid/content/ComponentName;)V
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

    invoke-static {}, Ljunit/runner/BaseTestRunner;->savePreferences()V

    :goto_1
    return-void
.end method
