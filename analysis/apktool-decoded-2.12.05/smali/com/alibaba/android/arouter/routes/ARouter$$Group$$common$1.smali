.class Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common$1;
.super Ljava/util/HashMap;
.source "ARouter$$Group$$common.java"


# annotations
.annotation system Ldalvik/annotation/EnclosingMethod;
    value = Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common;->loadInto(Ljava/util/Map;)V
.end annotation

.annotation system Ldalvik/annotation/InnerClass;
    accessFlags = 0x0
    name = null
.end annotation

.annotation system Ldalvik/annotation/Signature;
    value = {
        "Ljava/util/HashMap<",
        "Ljava/lang/String;",
        "Ljava/lang/Integer;",
        ">;"
    }
.end annotation


# instance fields
.field final synthetic this$0:Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common;


# direct methods
.method constructor <init>(Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common;)V
    .locals 1

    .line 20
    iput-object p1, p0, Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common$1;->this$0:Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common;

    invoke-direct {p0}, Ljava/util/HashMap;-><init>()V

    const/4 p1, 0x0

    invoke-static {p1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p1

    const-string v0, "multiClick"

    invoke-virtual {p0, v0, p1}, Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common$1;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    const/16 p1, 0x9

    invoke-static {p1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p1

    const-string v0, "params"

    invoke-virtual {p0, v0, p1}, Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common$1;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    const/16 p1, 0x8

    invoke-static {p1}, Ljava/lang/Integer;->valueOf(I)Ljava/lang/Integer;

    move-result-object p1

    const-string/jumbo v0, "url"

    invoke-virtual {p0, v0, p1}, Lcom/alibaba/android/arouter/routes/ARouter$$Group$$common$1;->put(Ljava/lang/Object;Ljava/lang/Object;)Ljava/lang/Object;

    return-void
.end method
