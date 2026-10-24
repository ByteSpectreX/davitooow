.class public Lcom/secneo/apkwrapper/H$a;
.super Landroid/os/Handler;
.source ""


# annotations
.annotation system Ldalvik/annotation/EnclosingClass;
    value = Lcom/secneo/apkwrapper/H;
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x9
    name = "a"
.end annotation


# direct methods
.method public constructor <init>()V
    .locals 6

    invoke-direct {p0}, Landroid/os/Handler;-><init>()V

    return-void
.end method


# virtual methods
.method public handleMessage(Landroid/os/Message;)V
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalGcInvocationCount()V

    :goto_1
    iget v0, p1, Landroid/os/Message;->what:I

    const/16 v1, 0x3e8

    if-eq v0, v1, :cond_0

    invoke-super {p0, p1}, Landroid/os/Handler;->handleMessage(Landroid/os/Message;)V

    goto :goto_2

    :cond_0
    :try_start_1
    sget-object v0, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    if-eqz v0, :cond_1

    sget-object v0, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    invoke-virtual {v0}, Landroid/app/Application;->getApplicationContext()Landroid/content/Context;

    move-result-object v0

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->us(Landroid/content/Context;)V
    :try_end_1
    .catch Ljava/lang/Throwable; {:try_start_1 .. :try_end_1} :catch_2

    :catch_2
    :cond_1
    iget p1, p1, Landroid/os/Message;->arg2:I

    invoke-static {p1}, Lcom/secneo/apkwrapper/H;->access$000(I)V

    :goto_2
    return-void
.end method
