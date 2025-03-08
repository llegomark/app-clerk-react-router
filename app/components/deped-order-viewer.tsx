// app/components/deped-order-viewer.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";
import { DownloadIcon, ExternalLinkIcon, CalendarIcon } from "lucide-react";
import type { DepEdOrder } from "~/types";

interface DepEdOrderViewerProps {
    order: DepEdOrder | null;
    isOpen: boolean;
    onClose: () => void;
    onDownload: (order: DepEdOrder) => void;
}

export function DepEdOrderViewer({
    order,
    isOpen,
    onClose,
    onDownload,
}: DepEdOrderViewerProps) {
    if (!order) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex justify-between items-start gap-4">
                        <DialogTitle className="text-left pr-8">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Badge variant="outline">DepEd Order No. {order.orderNumber}</Badge>
                                <Badge variant="outline">{order.year}</Badge>
                            </div>
                            <span className="block">{order.title}</span>
                        </DialogTitle>
                    </div>
                    <DialogDescription className="flex items-center gap-1.5 text-left">
                        <CalendarIcon className="size-3.5" />
                        <span>Date Issued: {formatDate(order.dateIssued)}</span>
                    </DialogDescription>
                </DialogHeader>

                {order.description && (
                    <>
                        <Separator />
                        <div className="text-sm">
                            <h3 className="text-xs font-medium mb-1.5">Description</h3>
                            <p className="text-muted-foreground text-xs whitespace-pre-line">
                                {order.description}
                            </p>
                        </div>
                    </>
                )}

                {order.tags && order.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {order.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <DialogFooter>
                    <div className="flex gap-2 items-center mt-2">
                        {order.fileUrl && (
                            <Button
                                variant="default"
                                onClick={() => onDownload(order)}
                                className="gap-1.5"
                            >
                                <DownloadIcon className="size-3.5" />
                                Download PDF
                            </Button>
                        )}

                        {/* View in browser button */}
                        {order.fileUrl && (
                            <Button
                                variant="outline"
                                onClick={() => window.open(order.fileUrl, '_blank')}
                                className="gap-1.5"
                            >
                                <ExternalLinkIcon className="size-3.5" />
                                View in Browser
                            </Button>
                        )}

                        <Button variant="ghost" onClick={onClose}>
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}