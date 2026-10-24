.class public Lcom/secneo/apkwrapper/H;
.super Ljava/lang/Object;
.source ""


# annotations
.annotation system Ldalvik/annotation/MemberClasses;
    value = {
        Lcom/secneo/apkwrapper/H$a;
    }
.end annotation


# static fields
.field public static ACFNAME:Ljava/lang/String;

.field public static APPNAME:Ljava/lang/String;

.field public static ARM_LIBRARY:Ljava/lang/String;

.field public static HAVEX86:Ljava/lang/String;

.field public static HAVEX8664:Ljava/lang/String;

.field public static ISSOPHIX:Ljava/lang/String;

.field public static ORI_AW_NAME:Ljava/lang/String;

.field public static PC_FLAG:Ljava/lang/String;

.field public static PKGNAME:Ljava/lang/String;

.field public static X86_LIBRARY:Ljava/lang/String;

.field private static isLoaded:Ljava/lang/Boolean;

.field public static sApp:Landroid/app/Application;

.field public static sAppInfo:Landroid/content/pm/ApplicationInfo;

.field private static final sConnection:Landroid/content/ServiceConnection;

.field private static sMessenger:Landroid/os/Messenger;

.field private static sService:Landroid/os/Messenger;


# direct methods
.method static constructor <clinit>()V
    .locals 6

    sget-object v0, Ljava/lang/Boolean;->FALSE:Ljava/lang/Boolean;

    sput-object v0, Lcom/secneo/apkwrapper/H;->isLoaded:Ljava/lang/Boolean;

    const-string v0, "com.mydito"

    sput-object v0, Lcom/secneo/apkwrapper/H;->PKGNAME:Ljava/lang/String;

    const-string v0, "com.mydito.DitoApplication"

    sput-object v0, Lcom/secneo/apkwrapper/H;->APPNAME:Ljava/lang/String;

    const-string v0, "androidx.core.app.CoreComponentFactory"

    sput-object v0, Lcom/secneo/apkwrapper/H;->ACFNAME:Ljava/lang/String;

    const-string v0, "###SOPHIX###"

    sput-object v0, Lcom/secneo/apkwrapper/H;->ISSOPHIX:Ljava/lang/String;

    const-string v0, "true"

    sput-object v0, Lcom/secneo/apkwrapper/H;->HAVEX86:Ljava/lang/String;

    const-string v0, "true"

    sput-object v0, Lcom/secneo/apkwrapper/H;->HAVEX8664:Ljava/lang/String;

    const-string v0, "DexHelper-x86"

    sput-object v0, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    const-string v0, "DexHelper"

    sput-object v0, Lcom/secneo/apkwrapper/H;->ARM_LIBRARY:Ljava/lang/String;

    const-string v0, "com.secneo.apkwrapper.AW"

    sput-object v0, Lcom/secneo/apkwrapper/H;->ORI_AW_NAME:Ljava/lang/String;

    const-string v0, "1000"

    sput-object v0, Lcom/secneo/apkwrapper/H;->PC_FLAG:Ljava/lang/String;

    const/4 v0, 0x0

    sput-object v0, Lcom/secneo/apkwrapper/H;->sService:Landroid/os/Messenger;

    sput-object v0, Lcom/secneo/apkwrapper/H;->sMessenger:Landroid/os/Messenger;

    new-instance v0, Lcom/secneo/apkwrapper/b;

    invoke-direct {v0}, Lcom/secneo/apkwrapper/b;-><init>()V

    sput-object v0, Lcom/secneo/apkwrapper/H;->sConnection:Landroid/content/ServiceConnection;

    return-void
.end method

.method public constructor <init>()V
    .locals 6

    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    return-void
.end method

.method public static Iii1Iii1IIIi1(I)I
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
    :try_start_1
    new-instance v0, Ljava/io/BufferedReader;

    new-instance v1, Ljava/io/FileReader;

    const-string v2, "/proc/self/status"

    invoke-direct {v1, v2}, Ljava/io/FileReader;-><init>(Ljava/lang/String;)V

    invoke-direct {v0, v1}, Ljava/io/BufferedReader;-><init>(Ljava/io/Reader;)V
    :try_end_1
    .catch Ljava/io/IOException; {:try_start_1 .. :try_end_1} :catch_4

    const/4 v1, 0x0

    :cond_0
    :try_start_2
    invoke-virtual {v0}, Ljava/io/BufferedReader;->readLine()Ljava/lang/String;

    move-result-object v2

    if-eqz v2, :cond_2

    if-nez p0, :cond_1

    const-string v3, "TracerPid:"

    invoke-virtual {v2, v3}, Ljava/lang/String;->startsWith(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_0

    const/16 p0, 0xa

    invoke-virtual {v2, p0}, Ljava/lang/String;->substring(I)Ljava/lang/String;

    move-result-object p0

    invoke-virtual {p0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object p0

    invoke-static {p0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result p0
    :try_end_2
    .catch Ljava/lang/Throwable; {:try_start_2 .. :try_end_2} :catch_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :try_start_3
    invoke-virtual {v0}, Ljava/io/BufferedReader;->close()V
    :try_end_3
    .catch Ljava/io/IOException; {:try_start_3 .. :try_end_3} :catch_4

    return p0

    :cond_1
    const/4 v3, 0x1

    if-ne p0, v3, :cond_0

    :try_start_4
    const-string v3, "PPid:"

    invoke-virtual {v2, v3}, Ljava/lang/String;->startsWith(Ljava/lang/String;)Z

    move-result v3

    if-eqz v3, :cond_0

    const/4 p0, 0x5

    invoke-virtual {v2, p0}, Ljava/lang/String;->substring(I)Ljava/lang/String;

    move-result-object p0

    invoke-virtual {p0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object p0

    invoke-static {p0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result p0
    :try_end_4
    .catch Ljava/lang/Throwable; {:try_start_4 .. :try_end_4} :catch_2
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    :try_start_5
    invoke-virtual {v0}, Ljava/io/BufferedReader;->close()V

    return p0

    :cond_2
    invoke-virtual {v0}, Ljava/io/BufferedReader;->close()V
    :try_end_5
    .catch Ljava/io/IOException; {:try_start_5 .. :try_end_5} :catch_4

    const/4 p0, 0x0

    return p0

    :catchall_0
    move-exception p0

    goto :goto_2

    :catch_2
    move-exception p0

    move-object v1, p0

    :try_start_6
    throw v1
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_0

    :goto_2
    if-eqz v1, :cond_3

    :try_start_7
    invoke-virtual {v0}, Ljava/io/BufferedReader;->close()V
    :try_end_7
    .catch Ljava/lang/Throwable; {:try_start_7 .. :try_end_7} :catch_3

    goto :goto_3

    :catch_3
    move-exception v0

    :try_start_8
    invoke-virtual {v1, v0}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_3

    :cond_3
    invoke-virtual {v0}, Ljava/io/BufferedReader;->close()V

    :goto_3
    throw p0
    :try_end_8
    .catch Ljava/io/IOException; {:try_start_8 .. :try_end_8} :catch_4

    :catch_4
    move-exception p0

    new-instance v0, Ljava/lang/RuntimeException;

    const-string v1, "read tracer"

    invoke-direct {v0, v1, p0}, Ljava/lang/RuntimeException;-><init>(Ljava/lang/String;Ljava/lang/Throwable;)V

    throw v0

    return-void
.end method

.method public static Iii1Iii1IlIi1(I)I
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
    :try_start_1
    new-instance v0, Ljava/io/FileInputStream;

    const-string v1, "/system/bin/app_process"

    invoke-direct {v0, v1}, Ljava/io/FileInputStream;-><init>(Ljava/lang/String;)V
    :try_end_1
    .catch Ljava/io/IOException; {:try_start_1 .. :try_end_1} :catch_4

    const/4 v1, 0x0

    :try_start_2
    invoke-virtual {v0}, Ljava/io/FileInputStream;->read()I
    :try_end_2
    .catch Ljava/lang/Throwable; {:try_start_2 .. :try_end_2} :catch_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    :try_start_3
    invoke-virtual {v0}, Ljava/io/FileInputStream;->close()V
    :try_end_3
    .catch Ljava/io/IOException; {:try_start_3 .. :try_end_3} :catch_4

    goto :goto_4

    :catchall_0
    move-exception v2

    goto :goto_2

    :catch_2
    move-exception v1

    :try_start_4
    throw v1
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    :goto_2
    if-eqz v1, :cond_0

    :try_start_5
    invoke-virtual {v0}, Ljava/io/FileInputStream;->close()V
    :try_end_5
    .catch Ljava/lang/Throwable; {:try_start_5 .. :try_end_5} :catch_3

    goto :goto_3

    :catch_3
    move-exception v0

    :try_start_6
    invoke-virtual {v1, v0}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_3

    :cond_0
    invoke-virtual {v0}, Ljava/io/FileInputStream;->close()V

    :goto_3
    throw v2
    :try_end_6
    .catch Ljava/io/IOException; {:try_start_6 .. :try_end_6} :catch_4

    :catch_4
    :goto_4
    const-wide/16 v0, 0x7d0

    invoke-static {v0, v1}, Landroid/os/SystemClock;->sleep(J)V

    invoke-static {p0}, Lcom/secneo/apkwrapper/H;->Iii1Iii1IIIi1(I)I

    move-result p0

    return p0
.end method

.method static synthetic access$000(I)V
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalExternalAllocSize()V

    :goto_1
    invoke-static {p0}, Lcom/secneo/apkwrapper/H;->he(I)V

    return-void
.end method

.method static synthetic access$100()Landroid/os/Messenger;
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
    sget-object v0, Lcom/secneo/apkwrapper/H;->sMessenger:Landroid/os/Messenger;

    return-object v0
.end method

.method static synthetic access$102(Landroid/os/Messenger;)Landroid/os/Messenger;
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
    sput-object p0, Lcom/secneo/apkwrapper/H;->sMessenger:Landroid/os/Messenger;

    return-object p0
.end method

.method static synthetic access$200()Landroid/os/Messenger;
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalExternalAllocSize()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/H;->sService:Landroid/os/Messenger;

    return-object v0
.end method

.method static synthetic access$202(Landroid/os/Messenger;)Landroid/os/Messenger;
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
    sput-object p0, Lcom/secneo/apkwrapper/H;->sService:Landroid/os/Messenger;

    return-object p0
.end method

.method private static native bs(Landroid/content/Context;I)Ljava/lang/Object;
.end method

.method public static bytes2int([B)I
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
    const/4 v0, 0x0

    aget-byte v1, p0, v0

    or-int/2addr v0, v1

    shl-int/lit8 v0, v0, 0x8

    const/4 v1, 0x1

    aget-byte v1, p0, v1

    or-int/2addr v0, v1

    shl-int/lit8 v0, v0, 0x8

    const/4 v1, 0x2

    aget-byte v1, p0, v1

    or-int/2addr v0, v1

    shl-int/lit8 v0, v0, 0x8

    const/4 v1, 0x3

    aget-byte p0, p0, v1

    or-int/2addr p0, v0

    return p0
.end method

.method public static callBS(Landroid/content/Context;)V
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
    sget-object v0, Lcom/secneo/apkwrapper/H;->PC_FLAG:Ljava/lang/String;

    invoke-static {v0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v0

    invoke-static {p0, v0}, Lcom/secneo/apkwrapper/H;->bs(Landroid/content/Context;I)Ljava/lang/Object;
    :try_end_1
    .catch Ljava/lang/Throwable; {:try_start_1 .. :try_end_1} :catch_2

    :catch_2
    return-void
.end method

.method public static native cis(I)I
.end method

.method public static native d(Ljava/lang/String;)Ljava/lang/String;
.end method

.method public static g(Ljava/lang/Object;)V
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

    invoke-static {}, Landroid/os/Debug;->resetGlobalExternalAllocCount()V

    :goto_1
    return-void
.end method

.method public static native gah()[Ljava/lang/Object;
.end method

.method public static getFieldValue(Ljava/lang/Class;Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/Object;
    .locals 6
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class<",
            "*>;",
            "Ljava/lang/Object;",
            "Ljava/lang/String;",
            ")",
            "Ljava/lang/Object;"
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

    invoke-static {}, Landroid/net/TrafficStats;->clearThreadStatsTag()V

    :goto_1
    :try_start_1
    invoke-virtual {p0, p2}, Ljava/lang/Class;->getDeclaredField(Ljava/lang/String;)Ljava/lang/reflect/Field;

    move-result-object p0

    const/4 p2, 0x1

    invoke-virtual {p0, p2}, Ljava/lang/reflect/Field;->setAccessible(Z)V

    invoke-virtual {p0, p1}, Ljava/lang/reflect/Field;->get(Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object p0
    :try_end_1
    .catch Ljava/lang/NoSuchFieldException; {:try_start_1 .. :try_end_1} :catch_4
    .catch Ljava/lang/IllegalAccessException; {:try_start_1 .. :try_end_1} :catch_3
    .catch Ljava/lang/IllegalArgumentException; {:try_start_1 .. :try_end_1} :catch_2

    return-object p0

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    goto :goto_2

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalAccessException;->printStackTrace()V

    goto :goto_2

    :catch_4
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/NoSuchFieldException;->printStackTrace()V

    :goto_2
    const/4 p0, 0x0

    return-object p0
.end method

.method public static getFieldValue(Ljava/lang/String;Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/Object;
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

    invoke-static {}, Landroid/os/Debug;->startAllocCounting()V

    :goto_1
    :try_start_1
    invoke-static {p0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object p0

    invoke-static {p0, p1, p2}, Lcom/secneo/apkwrapper/H;->getFieldValue(Ljava/lang/Class;Ljava/lang/Object;Ljava/lang/String;)Ljava/lang/Object;

    move-result-object p0
    :try_end_1
    .catch Ljava/lang/ClassNotFoundException; {:try_start_1 .. :try_end_1} :catch_3
    .catch Ljava/lang/IllegalArgumentException; {:try_start_1 .. :try_end_1} :catch_2

    return-object p0

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    goto :goto_2

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/ClassNotFoundException;->printStackTrace()V

    :goto_2
    const/4 p0, 0x0

    return-object p0
.end method

.method private static getRuntimeAbi()I
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

    invoke-static {}, Landroid/os/Debug;->stopNativeTracing()V

    :goto_1
    const/16 v0, 0x14

    new-array v0, v0, [B

    const/4 v1, 0x0

    const/4 v2, 0x0

    :try_start_1
    new-instance v3, Ljava/io/FileInputStream;

    const-string v4, "/proc/self/exe"

    invoke-direct {v3, v4}, Ljava/io/FileInputStream;-><init>(Ljava/lang/String;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_4
    .catchall {:try_start_1 .. :try_end_1} :catchall_1

    :try_start_2
    invoke-virtual {v3, v0}, Ljava/io/FileInputStream;->read([B)I

    const/4 v2, 0x4

    new-array v2, v2, [B

    aput-byte v1, v2, v1

    const/4 v4, 0x1

    aput-byte v1, v2, v4

    const/16 v5, 0x13

    aget-byte v5, v0, v5

    const/4 v6, 0x2

    aput-byte v5, v2, v6

    const/16 v5, 0x12

    aget-byte v0, v0, v5

    const/4 v5, 0x3

    aput-byte v0, v2, v5

    invoke-static {v2}, Lcom/secneo/apkwrapper/H;->bytes2int([B)I

    move-result v0
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    if-eq v0, v5, :cond_1

    const/4 v2, 0x6

    if-eq v0, v2, :cond_1

    const/4 v2, 0x7

    if-ne v0, v2, :cond_0

    goto :goto_2

    :cond_0
    const/16 v2, 0x3e

    if-ne v0, v2, :cond_2

    const/4 v1, 0x2

    goto :goto_3

    :cond_1
    :goto_2
    const/4 v1, 0x1

    :cond_2
    :goto_3
    :try_start_3
    invoke-virtual {v3}, Ljava/io/FileInputStream;->close()V
    :try_end_3
    .catch Ljava/io/IOException; {:try_start_3 .. :try_end_3} :catch_5

    goto :goto_6

    :catchall_0
    move-exception v0

    goto :goto_4

    :catch_2
    nop

    goto :goto_5

    :catchall_1
    move-exception v0

    move-object v3, v2

    :goto_4
    if-eqz v3, :cond_3

    :try_start_4
    invoke-virtual {v3}, Ljava/io/FileInputStream;->close()V
    :try_end_4
    .catch Ljava/io/IOException; {:try_start_4 .. :try_end_4} :catch_3

    :catch_3
    :cond_3
    throw v0

    :catch_4
    move-object v3, v2

    :goto_5
    if-eqz v3, :cond_4

    goto :goto_3

    :catch_5
    :cond_4
    :goto_6
    return v1
.end method

.method public static native gha(Ljava/lang/String;)I
.end method

.method public static native ghc(Ljava/lang/String;)J
.end method

.method public static native gv()I
.end method

.method private static native he(I)V
.end method

.method public static init()V
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

    invoke-static {}, Landroid/os/Debug;->startAllocCounting()V

    :goto_1
    const/4 v0, 0x0

    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->Iii1Iii1IIIi1(I)I

    return-void
.end method

.method public static varargs invokeMethod(Ljava/lang/Class;Ljava/lang/Object;[Ljava/lang/Object;Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/Object;
    .locals 6
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class<",
            "*>;",
            "Ljava/lang/Object;",
            "[",
            "Ljava/lang/Object;",
            "Ljava/lang/String;",
            "[",
            "Ljava/lang/Class<",
            "*>;)",
            "Ljava/lang/Object;"
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
    :try_start_1
    invoke-virtual {p0, p3, p4}, Ljava/lang/Class;->getDeclaredMethod(Ljava/lang/String;[Ljava/lang/Class;)Ljava/lang/reflect/Method;

    move-result-object p0

    const/4 p3, 0x1

    invoke-virtual {p0, p3}, Ljava/lang/reflect/Method;->setAccessible(Z)V

    invoke-virtual {p0, p1, p2}, Ljava/lang/reflect/Method;->invoke(Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;

    move-result-object p0
    :try_end_1
    .catch Ljava/lang/NoSuchMethodException; {:try_start_1 .. :try_end_1} :catch_5
    .catch Ljava/lang/IllegalAccessException; {:try_start_1 .. :try_end_1} :catch_4
    .catch Ljava/lang/IllegalArgumentException; {:try_start_1 .. :try_end_1} :catch_3
    .catch Ljava/lang/reflect/InvocationTargetException; {:try_start_1 .. :try_end_1} :catch_2

    return-object p0

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/reflect/InvocationTargetException;->printStackTrace()V

    goto :goto_2

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    goto :goto_2

    :catch_4
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalAccessException;->printStackTrace()V

    goto :goto_2

    :catch_5
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/NoSuchMethodException;->printStackTrace()V

    :goto_2
    const/4 p0, 0x0

    return-object p0
.end method

.method public static native is(I)Z
.end method

.method public static isNeedLoadX86()Z
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

    invoke-static {}, Landroid/os/Debug;->waitForDebugger()V

    :goto_1
    sget-object v0, Lcom/secneo/apkwrapper/H;->HAVEX86:Ljava/lang/String;

    const-string v1, "true"

    invoke-virtual {v0, v1}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v0

    sget-object v2, Lcom/secneo/apkwrapper/H;->HAVEX8664:Ljava/lang/String;

    invoke-virtual {v2, v1}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z

    move-result v1

    invoke-static {}, Lcom/secneo/apkwrapper/H;->getRuntimeAbi()I

    move-result v2

    const/4 v3, 0x1

    if-ne v2, v3, :cond_0

    if-nez v0, :cond_0

    return v3

    :cond_0
    const/4 v0, 0x2

    if-ne v2, v0, :cond_1

    if-nez v1, :cond_1

    return v3

    :cond_1
    const/4 v0, 0x0

    return v0
.end method

.method public static load(Landroid/content/pm/ApplicationInfo;)V
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
    sget-object v0, Lcom/secneo/apkwrapper/H;->isLoaded:Ljava/lang/Boolean;

    monitor-enter v0

    :try_start_1
    sget-object v1, Lcom/secneo/apkwrapper/H;->isLoaded:Ljava/lang/Boolean;

    invoke-virtual {v1}, Ljava/lang/Boolean;->booleanValue()Z

    move-result v1
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    if-nez v1, :cond_1

    :try_start_2
    invoke-static {}, Lcom/secneo/apkwrapper/H;->isNeedLoadX86()Z

    move-result v1

    if-eqz v1, :cond_0

    sget-object v1, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    :goto_2
    invoke-static {v1}, Ljava/lang/System;->loadLibrary(Ljava/lang/String;)V

    goto :goto_3

    :cond_0
    sget-object v1, Lcom/secneo/apkwrapper/H;->ARM_LIBRARY:Ljava/lang/String;
    :try_end_2
    .catch Ljava/lang/Throwable; {:try_start_2 .. :try_end_2} :catch_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_0

    goto :goto_2

    :catch_2
    :try_start_3
    invoke-static {p0}, Lcom/secneo/apkwrapper/H;->loadLib(Landroid/content/pm/ApplicationInfo;)V

    :goto_3
    sget-object p0, Ljava/lang/Boolean;->TRUE:Ljava/lang/Boolean;

    sput-object p0, Lcom/secneo/apkwrapper/H;->isLoaded:Ljava/lang/Boolean;

    :cond_1
    monitor-exit v0

    return-void

    :catchall_0
    move-exception p0

    monitor-exit v0
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    throw p0

    return-void
.end method

.method public static loadLib(Landroid/content/pm/ApplicationInfo;)V
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
    sget v0, Landroid/os/Build$VERSION;->SDK_INT:I

    const/16 v1, 0x13

    if-ge v0, v1, :cond_0

    return-void

    :cond_0
    invoke-static {}, Lcom/secneo/apkwrapper/H;->getRuntimeAbi()I

    move-result v0

    if-nez v0, :cond_1

    return-void

    :cond_1
    iget-object v1, p0, Landroid/content/pm/ApplicationInfo;->sourceDir:Ljava/lang/String;

    new-instance v2, Ljava/io/File;

    iget-object p0, p0, Landroid/content/pm/ApplicationInfo;->dataDir:Ljava/lang/String;

    const-string v3, ".cache"

    invoke-direct {v2, p0, v3}, Ljava/io/File;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {v2}, Ljava/io/File;->exists()Z

    move-result p0

    if-nez p0, :cond_2

    invoke-virtual {v2}, Ljava/io/File;->mkdirs()Z

    :cond_2
    new-instance p0, Ljava/io/File;

    new-instance v3, Ljava/lang/StringBuilder;

    invoke-direct {v3}, Ljava/lang/StringBuilder;-><init>()V

    const-string v4, "lib"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v4, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    const-string v4, ".so"

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-direct {p0, v2, v3}, Ljava/io/File;-><init>(Ljava/io/File;Ljava/lang/String;)V

    :try_start_1
    new-instance v2, Ljava/util/zip/ZipFile;

    invoke-direct {v2, v1}, Ljava/util/zip/ZipFile;-><init>(Ljava/lang/String;)V

    const/4 v1, 0x1

    const/4 v3, 0x0

    if-ne v0, v1, :cond_4

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "lib/armeabi-v7a/lib"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/util/zip/ZipFile;->getEntry(Ljava/lang/String;)Ljava/util/zip/ZipEntry;

    move-result-object v0

    if-nez v0, :cond_3

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "lib/armeabi/lib"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/util/zip/ZipFile;->getEntry(Ljava/lang/String;)Ljava/util/zip/ZipEntry;

    move-result-object v0

    :cond_3
    if-nez v0, :cond_6

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "lib/x86/lib"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Lcom/secneo/apkwrapper/H;->ARM_LIBRARY:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    :goto_2
    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/util/zip/ZipFile;->getEntry(Ljava/lang/String;)Ljava/util/zip/ZipEntry;

    move-result-object v0

    goto :goto_3

    :cond_4
    const/4 v1, 0x2

    if-ne v0, v1, :cond_5

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "lib/arm64-v8a/lib"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Lcom/secneo/apkwrapper/H;->X86_LIBRARY:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v2, v0}, Ljava/util/zip/ZipFile;->getEntry(Ljava/lang/String;)Ljava/util/zip/ZipEntry;

    move-result-object v0

    if-nez v0, :cond_6

    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "lib/x86_64/lib"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    sget-object v1, Lcom/secneo/apkwrapper/H;->ARM_LIBRARY:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    invoke-virtual {v0, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_6

    goto :goto_2

    :cond_5
    move-object v0, v3

    :cond_6
    :goto_3
    if-nez v0, :cond_7

    return-void

    :cond_7
    :try_start_2
    invoke-virtual {v2, v0}, Ljava/util/zip/ZipFile;->getInputStream(Ljava/util/zip/ZipEntry;)Ljava/io/InputStream;

    move-result-object v0
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_4
    .catchall {:try_start_2 .. :try_end_2} :catchall_2

    :try_start_3
    new-instance v1, Ljava/io/FileOutputStream;

    invoke-direct {v1, p0}, Ljava/io/FileOutputStream;-><init>(Ljava/io/File;)V
    :try_end_3
    .catch Ljava/lang/Exception; {:try_start_3 .. :try_end_3} :catch_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_1

    const/16 v2, 0x1000

    :try_start_4
    new-array v2, v2, [B

    :goto_4
    invoke-virtual {v0, v2}, Ljava/io/InputStream;->read([B)I

    move-result v3

    const/4 v4, -0x1

    if-eq v3, v4, :cond_8

    const/4 v4, 0x0

    invoke-virtual {v1, v2, v4, v3}, Ljava/io/FileOutputStream;->write([BII)V

    goto :goto_4

    :cond_8
    invoke-virtual {v1}, Ljava/io/FileOutputStream;->flush()V
    :try_end_4
    .catch Ljava/lang/Exception; {:try_start_4 .. :try_end_4} :catch_2
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    if-eqz v0, :cond_9

    :try_start_5
    invoke-virtual {v0}, Ljava/io/InputStream;->close()V

    :cond_9
    :goto_5
    invoke-virtual {v1}, Ljava/io/FileOutputStream;->close()V
    :try_end_5
    .catch Ljava/lang/Exception; {:try_start_5 .. :try_end_5} :catch_6

    goto :goto_8

    :catchall_0
    move-exception p0

    goto :goto_9

    :catch_2
    move-exception v2

    goto :goto_6

    :catchall_1
    move-exception p0

    move-object v1, v3

    goto :goto_9

    :catch_3
    move-exception v2

    move-object v1, v3

    :goto_6
    move-object v3, v0

    goto :goto_7

    :catchall_2
    move-exception p0

    move-object v0, v3

    move-object v1, v0

    goto :goto_9

    :catch_4
    move-exception v2

    move-object v1, v3

    :goto_7
    :try_start_6
    invoke-virtual {v2}, Ljava/lang/Exception;->printStackTrace()V
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_3

    if-eqz v3, :cond_a

    :try_start_7
    invoke-virtual {v3}, Ljava/io/InputStream;->close()V
    :try_end_7
    .catch Ljava/lang/Exception; {:try_start_7 .. :try_end_7} :catch_6

    :cond_a
    if-eqz v1, :cond_b

    goto :goto_5

    :cond_b
    :goto_8
    :try_start_8
    invoke-virtual {p0}, Ljava/io/File;->getAbsolutePath()Ljava/lang/String;

    move-result-object p0

    invoke-static {p0}, Lcom/secneo/apkwrapper/H;->sl(Ljava/lang/String;)V
    :try_end_8
    .catch Ljava/lang/Throwable; {:try_start_8 .. :try_end_8} :catch_5

    goto :goto_a

    :catch_5
    move-exception p0

    :try_start_9
    invoke-virtual {p0}, Ljava/lang/Throwable;->printStackTrace()V

    goto :goto_a

    :catchall_3
    move-exception p0

    move-object v0, v3

    :goto_9
    if-eqz v0, :cond_c

    invoke-virtual {v0}, Ljava/io/InputStream;->close()V

    :cond_c
    if-eqz v1, :cond_d

    invoke-virtual {v1}, Ljava/io/FileOutputStream;->close()V

    :cond_d
    throw p0
    :try_end_9
    .catch Ljava/lang/Exception; {:try_start_9 .. :try_end_9} :catch_6

    :catch_6
    :goto_a
    return-void
.end method

.method public static main([Ljava/lang/String;)V
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

    invoke-static {}, Landroid/os/Debug;->stopNativeTracing()V

    :goto_1
    array-length v0, p0

    const/4 v1, 0x1

    const/4 v2, 0x4

    if-eq v0, v2, :cond_0

    invoke-static {v1}, Ljava/lang/System;->exit(I)V

    :cond_0
    const/4 v0, 0x0

    const/4 v2, 0x0

    :try_start_1
    aget-object v3, p0, v1

    invoke-static {v3}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v3

    invoke-static {v3}, Landroid/os/ParcelFileDescriptor;->adoptFd(I)Landroid/os/ParcelFileDescriptor;

    move-result-object v3
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_2

    const/4 v4, 0x3

    :try_start_2
    aget-object p0, p0, v4

    invoke-static {p0}, Ljava/lang/Integer;->parseInt(Ljava/lang/String;)I

    move-result v0
    :try_end_2
    .catch Ljava/lang/Exception; {:try_start_2 .. :try_end_2} :catch_3

    goto :goto_2

    :catch_2
    move-object v3, v2

    :catch_3
    invoke-static {v1}, Ljava/lang/System;->exit(I)V

    :goto_2
    :try_start_3
    invoke-static {v0}, Lcom/secneo/apkwrapper/H;->Iii1Iii1IlIi1(I)I

    move-result p0

    new-instance v0, Ljava/io/DataOutputStream;

    new-instance v4, Landroid/os/ParcelFileDescriptor$AutoCloseOutputStream;

    invoke-direct {v4, v3}, Landroid/os/ParcelFileDescriptor$AutoCloseOutputStream;-><init>(Landroid/os/ParcelFileDescriptor;)V

    invoke-direct {v0, v4}, Ljava/io/DataOutputStream;-><init>(Ljava/io/OutputStream;)V
    :try_end_3
    .catch Ljava/lang/Throwable; {:try_start_3 .. :try_end_3} :catch_6

    :try_start_4
    invoke-static {p0}, Ljava/lang/Integer;->toString(I)Ljava/lang/String;

    move-result-object p0

    invoke-virtual {v0, p0}, Ljava/io/DataOutputStream;->writeUTF(Ljava/lang/String;)V
    :try_end_4
    .catch Ljava/lang/Throwable; {:try_start_4 .. :try_end_4} :catch_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_0

    :try_start_5
    invoke-virtual {v0}, Ljava/io/DataOutputStream;->close()V
    :try_end_5
    .catch Ljava/lang/Throwable; {:try_start_5 .. :try_end_5} :catch_6

    goto :goto_5

    :catchall_0
    move-exception p0

    goto :goto_3

    :catch_4
    move-exception p0

    move-object v2, p0

    :try_start_6
    throw v2
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_0

    :goto_3
    if-eqz v2, :cond_1

    :try_start_7
    invoke-virtual {v0}, Ljava/io/DataOutputStream;->close()V
    :try_end_7
    .catch Ljava/lang/Throwable; {:try_start_7 .. :try_end_7} :catch_5

    goto :goto_4

    :catch_5
    move-exception v0

    :try_start_8
    invoke-virtual {v2, v0}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    goto :goto_4

    :cond_1
    invoke-virtual {v0}, Ljava/io/DataOutputStream;->close()V

    :goto_4
    throw p0
    :try_end_8
    .catch Ljava/lang/Throwable; {:try_start_8 .. :try_end_8} :catch_6

    :catch_6
    invoke-static {v1}, Ljava/lang/System;->exit(I)V

    :goto_5
    return-void
.end method

.method public static setFieldValue(Ljava/lang/Class;Ljava/lang/Object;Ljava/lang/String;Ljava/lang/Object;)Z
    .locals 6
    .annotation system Ldalvik/annotation/Signature;
        value = {
            "(",
            "Ljava/lang/Class<",
            "*>;",
            "Ljava/lang/Object;",
            "Ljava/lang/String;",
            "Ljava/lang/Object;",
            ")Z"
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

    invoke-static {}, Landroid/view/ViewDebug;->stopRecyclerTracing()V

    :goto_1
    :try_start_1
    invoke-virtual {p0, p2}, Ljava/lang/Class;->getDeclaredField(Ljava/lang/String;)Ljava/lang/reflect/Field;

    move-result-object p0

    const/4 p2, 0x1

    invoke-virtual {p0, p2}, Ljava/lang/reflect/Field;->setAccessible(Z)V

    invoke-virtual {p0, p1, p3}, Ljava/lang/reflect/Field;->set(Ljava/lang/Object;Ljava/lang/Object;)V
    :try_end_1
    .catch Ljava/lang/NoSuchFieldException; {:try_start_1 .. :try_end_1} :catch_4
    .catch Ljava/lang/IllegalAccessException; {:try_start_1 .. :try_end_1} :catch_3
    .catch Ljava/lang/IllegalArgumentException; {:try_start_1 .. :try_end_1} :catch_2

    return p2

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    goto :goto_2

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalAccessException;->printStackTrace()V

    goto :goto_2

    :catch_4
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/NoSuchFieldException;->printStackTrace()V

    :goto_2
    const/4 p0, 0x0

    return p0
.end method

.method public static setFieldValue(Ljava/lang/String;Ljava/lang/Object;Ljava/lang/String;Ljava/lang/Object;)Z
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
    :try_start_1
    invoke-static {p0}, Ljava/lang/Class;->forName(Ljava/lang/String;)Ljava/lang/Class;

    move-result-object p0

    invoke-static {p0, p1, p2, p3}, Lcom/secneo/apkwrapper/H;->setFieldValue(Ljava/lang/Class;Ljava/lang/Object;Ljava/lang/String;Ljava/lang/Object;)Z
    :try_end_1
    .catch Ljava/lang/ClassNotFoundException; {:try_start_1 .. :try_end_1} :catch_3
    .catch Ljava/lang/IllegalArgumentException; {:try_start_1 .. :try_end_1} :catch_2

    const/4 p0, 0x1

    return p0

    :catch_2
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/IllegalArgumentException;->printStackTrace()V

    goto :goto_2

    :catch_3
    move-exception p0

    invoke-virtual {p0}, Ljava/lang/ClassNotFoundException;->printStackTrace()V

    :goto_2
    const/4 p0, 0x0

    return p0
.end method

.method public static native sha(Ljava/lang/String;I)V
.end method

.method public static showToast(Ljava/lang/String;I)V
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
    sget-object v0, Lcom/secneo/apkwrapper/H;->sApp:Landroid/app/Application;

    if-eqz v0, :cond_1

    invoke-virtual {v0}, Landroid/app/Application;->getBaseContext()Landroid/content/Context;

    move-result-object v0

    if-nez v0, :cond_0

    goto :goto_2

    :cond_0
    new-instance v0, Landroid/os/Handler;

    invoke-static {}, Landroid/os/Looper;->getMainLooper()Landroid/os/Looper;

    move-result-object v1

    invoke-direct {v0, v1}, Landroid/os/Handler;-><init>(Landroid/os/Looper;)V

    new-instance v1, Lcom/secneo/apkwrapper/a;

    invoke-direct {v1, p0, p1}, Lcom/secneo/apkwrapper/a;-><init>(Ljava/lang/String;I)V

    invoke-virtual {v0, v1}, Landroid/os/Handler;->post(Ljava/lang/Runnable;)Z

    :cond_1
    :goto_2
    return-void
.end method

.method private static native sl(Ljava/lang/String;)V
.end method

.method public static native sn(Ljava/lang/String;)I
.end method

.method public static native us(Landroid/content/Context;)V
.end method
